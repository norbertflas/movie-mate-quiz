
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

// Implementation using the Movie of the Night Streaming Availability API
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
        const options = {
          method: 'GET',
          url: 'https://streaming-availability.p.rapidapi.com/shows/search/title',
          params: {
            title: title,
            country: country.toLowerCase(),
            output_language: i18n.language === 'pl' ? 'pl' : 'en', // Fixed syntax error
            show_type: 'movie',
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
            
            // Extract streaming info
            if (matchingMovie.streamingInfo && matchingMovie.streamingInfo[country.toLowerCase()]) {
              const streamingOptions = matchingMovie.streamingInfo[country.toLowerCase()];
              
              for (const option of streamingOptions) {
                services.push({
                  service: option.service,
                  available: true,
                  link: option.link,
                  logo: `/streaming-icons/${option.service.toLowerCase()}.svg`,
                  type: option.type || 'subscription',
                  source: 'rapid-api'
                });
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
        // Continue to next method
      }
    }
    
    // If title search failed, return empty array - removed incorrect fallback to /v4/title
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
        body: { tmdbId, country }
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
    
    // Try the RapidAPI endpoint
    try {
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
    
    // If all methods failed, return an empty array
    return [];
  } catch (error) {
    console.error('Error in getStreamingAvailability:', error);
    return [];
  }
}
