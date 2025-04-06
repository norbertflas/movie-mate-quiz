import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";
import axios from 'axios';
import i18n from "@/i18n";
import { formatServiceLinks } from "@/utils/streamingServices";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Get API key from environment variables
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory cache for the current session
const localCache: Record<string, StreamingAvailabilityCache> = {};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error('Error in retryWithBackoff:', error);

    if (retries === 0) {
      throw error;
    }

    const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
    
    if (error?.status === 429 || error?.message?.includes('429')) {
      const retryAfter = (errorBody?.retryAfter || 60) * 1000;
      console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
      await sleep(retryAfter);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Implementation using the Movie of the Night Streaming Availability API (v4)
async function fetchStreamingAvailabilityAPI(
  tmdbId: number,
  title?: string,
  year?: string,
  country: string = 'pl'
): Promise<StreamingPlatformData[]> {
  try {
    // Check local memory cache first
    const cacheKey = `${tmdbId}-${country}`;
    if (localCache[cacheKey] && (Date.now() - localCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log('Using memory cached streaming data for:', tmdbId);
      return localCache[cacheKey].data;
    }
    
    console.log(`Fetching Movie of the Night API for TMDB ID: ${tmdbId} in country: ${country}`);
    
    // Try title-based search first since it seems to be the most reliable endpoint
    if (title) {
      try {
        console.log('Using title search with:', title);
        
        // Use only supported languages for output_language parameter
        // The API supports a limited set of languages: en, es, fr, de, it
        const supportedLanguages = ['en', 'es', 'fr', 'de', 'it'];
        const outputLanguage = supportedLanguages.includes(i18n.language) ? i18n.language : 'en';
        
        const options = {
          method: 'GET',
          url: 'https://streaming-availability.p.rapidapi.com/shows/search/title',
          params: {
            title: title,
            country: country.toLowerCase(),
            output_language: outputLanguage, // Use supported language
            show_type: 'movie',
            series_granularity: 'show',
            year: year
          },
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        };

        const response = await retryWithBackoff(() => axios.request(options));
        
        if (response.data && Array.isArray(response.data.result)) {
          console.log(`Title search returned ${response.data.result.length} results`);
          
          // Find the matching movie in results
          const matchingMovie = response.data.result.find((movie: any) => {
            return movie.tmdbId === tmdbId || String(movie.tmdbId) === String(tmdbId);
          });
          
          if (matchingMovie) {
            console.log('Found matching movie in results:', matchingMovie.title);
            
            const services: StreamingPlatformData[] = [];
            
            // Extract streaming info - API v4 format
            if (matchingMovie.streamingInfo && matchingMovie.streamingInfo[country.toLowerCase()]) {
              const streamingOptions = matchingMovie.streamingInfo[country.toLowerCase()];
              
              // In v4, streamingInfo structure is {service: [{link, type}]} instead of array of items
              for (const [service, options] of Object.entries(streamingOptions)) {
                if (Array.isArray(options) && options.length > 0) {
                  services.push({
                    service,
                    available: true,
                    link: options[0].link,
                    logo: `/streaming-icons/${service.toLowerCase()}.svg`,
                    type: options[0].type || 'subscription',
                    source: 'rapid-api'
                  });
                }
              }
            }
            
            // Cache the result
            localCache[cacheKey] = {
              data: services,
              timestamp: Date.now()
            };
            
            return services;
          } else {
            console.log('No exact match found in search results');
          }
        }
      } catch (error) {
        console.error('Error with title-based search:', error);
        // Fall back to next method
      }
    }
    
    // If title search failed, try direct TMDB ID search with the v4 shows/movie endpoint
    try {
      console.log('Trying direct TMDB ID lookup with v4 endpoint shows/movie');
      const options = {
        method: 'GET',
        url: `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}`,
        params: {
          country: country.toLowerCase()
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      };
      
      const response = await retryWithBackoff(() => axios.request(options));
      
      if (response.data?.streamingInfo) {
        console.log('Got streaming info from direct TMDB ID lookup');
        
        const services: StreamingPlatformData[] = [];
        const countryServices = response.data.streamingInfo[country.toLowerCase()];
        
        if (countryServices) {
          // In v4, the structure is {serviceName: [{link, type}]}
          for (const [service, options] of Object.entries(countryServices)) {
            if (Array.isArray(options) && options.length > 0) {
              services.push({
                service,
                available: true,
                link: options[0].link,
                logo: `/streaming-icons/${service.toLowerCase()}.svg`,
                type: options[0].type || 'subscription',
                source: 'rapid-api-direct'
              });
            }
          }
        }
        
        // Cache the result
        localCache[cacheKey] = {
          data: services,
          timestamp: Date.now()
        };
        
        return services;
      }
    } catch (error) {
      console.error('Error with direct TMDB ID lookup:', error);
      // Continue to next method or return empty array
    }
    
    console.log('No streaming services found after trying available methods');
    return [];
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return [];
  }
}

// Main function to get streaming availability
export async function getStreamingAvailability(
  tmdbId: number,
  title?: string,
  year?: string,
  country: string = 'pl'
): Promise<StreamingPlatformData[]> {
  try {
    // Try with our streaming availability Supabase function first
    try {
      const { data, error } = await supabase.functions.invoke('streaming-availability', {
        body: { tmdbId, country, title, year }
      });
      
      if (error) {
        console.error('Error calling streaming-availability function:', error);
      } else if (data && Array.isArray(data.result) && data.result.length > 0) {
        console.log(`Received ${data.result.length} streaming services from edge function`);
        
        return data.result.map((service: any) => ({
          ...service,
          logo: `/streaming-icons/${service.service.toLowerCase().replace(/\s+/g, '')}.svg`,
          source: 'edge-function'
        }));
      } else {
        console.log('No streaming data from edge function, trying fallback methods');
      }
    } catch (error) {
      console.error('Exception calling streaming-availability function:', error);
    }
    
    // Try the RapidAPI endpoint with v4 API
    try {
      console.log('[hook] Attempting to fetch with RapidAPI');
      const services = await fetchStreamingAvailabilityAPI(tmdbId, title, year, country);
      if (services.length > 0) {
        console.log(`Found ${services.length} streaming services via RapidAPI`);
        return services;
      }
    } catch (error) {
      console.error('Error with RapidAPI fallback:', error);
    }
    
    // Try Gemini API if available through our edge function
    try {
      console.log('Trying Gemini fallback for movie:', tmdbId);
      const { data, error } = await supabase.functions.invoke('streaming-availability-gemini', {
        body: { tmdbId, title, country }
      });
      
      if (error) {
        console.error('Error calling Gemini function:', error);
      } else if (data && Array.isArray(data.services) && data.services.length > 0) {
        console.log(`Received ${data.services.length} streaming services from Gemini`);
        
        return data.services.map((service: any) => ({
          ...service,
          source: 'gemini'
        }));
      }
    } catch (error) {
      console.error('Exception calling Gemini function:', error);
    }
    
    // Try Watchmode API for additional coverage
    try {
      console.log('Trying Watchmode fallback for movie:', tmdbId);
      const services = await fetchWatchmodeData(tmdbId, title, country);
      if (services.length > 0) {
        console.log(`Found ${services.length} streaming services via Watchmode`);
        return services;
      }
    } catch (error) {
      console.error('Error with Watchmode fallback:', error);
    }
    
    // If all methods failed, return an empty array
    return [];
  } catch (error) {
    console.error('Error in getStreamingAvailability:', error);
    return [];
  }
}

// Function to fetch data from Watchmode API via our edge function
async function fetchWatchmodeData(
  tmdbId: number,
  title?: string,
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    // Try first with TMDB ID
    const { data: watchmodeData, error: watchmodeError } = await supabase.functions.invoke('watchmode-availability', {
      body: { tmdbId, region: country.toUpperCase() }
    });
    
    if (watchmodeError) {
      console.error('Error calling watchmode-availability:', watchmodeError);
      return [];
    }
    
    if (watchmodeData?.sources && Array.isArray(watchmodeData.sources) && watchmodeData.sources.length > 0) {
      return watchmodeData.sources.map((source: any) => ({
        service: source.service,
        available: true,
        link: source.link || '',
        logo: source.logo || `/streaming-icons/default.svg`,
        type: source.type || 'subscription',
        source: 'watchmode'
      }));
    }
    
    // If no results with TMDB ID, try with title search
    if (title) {
      const { data: searchData, error: searchError } = await supabase.functions.invoke('watchmode-title-search', {
        body: { 
          searchQuery: title,
          searchField: 'name',
          types: 'movie',
          region: country.toUpperCase()
        }
      });
      
      if (searchError) {
        console.error('Error calling watchmode-title-search:', searchError);
        return [];
      }
      
      if (searchData?.results && searchData.results.length > 0) {
        // Get first result's ID
        const watchmodeId = searchData.results[0].id;
        
        // Get details with this ID
        const { data: detailsData, error: detailsError } = await supabase.functions.invoke('watchmode-title-details', {
          body: {
            titleId: watchmodeId,
            region: country.toUpperCase(),
            includeSources: true
          }
        });
        
        if (detailsError) {
          console.error('Error calling watchmode-title-details:', detailsError);
          return [];
        }
        
        if (detailsData?.sources && Array.isArray(detailsData.sources) && detailsData.sources.length > 0) {
          return detailsData.sources.map((source: any) => ({
            service: source.service,
            available: true,
            link: source.link || '',
            logo: source.logo || `/streaming-icons/default.svg`,
            type: source.type || 'subscription',
            source: 'watchmode-search'
          }));
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchWatchmodeData:', error);
    return [];
  }
}
