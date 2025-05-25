
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";
import axios from 'axios';
import i18n from "@/i18n";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Get API key from environment variables
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory cache for the current session
const localCache: Record<string, StreamingAvailabilityCache> = {};

// Service name mapping for consistency
const serviceNameMap: Record<string, string> = {
  'netflix': 'Netflix',
  'amazon': 'Prime Video',
  'amazon prime video': 'Prime Video',
  'amazon prime': 'Prime Video',
  'prime video': 'Prime Video',
  'disney': 'Disney+',
  'disney plus': 'Disney+',
  'disneyplus': 'Disney+',
  'hulu': 'Hulu',
  'hbo': 'HBO Max',
  'hbomax': 'HBO Max',
  'hbo max': 'HBO Max',
  'max': 'Max',
  'apple': 'Apple TV+',
  'appletv': 'Apple TV+',
  'apple tv': 'Apple TV+',
  'apple tv+': 'Apple TV+',
  'apple tv plus': 'Apple TV+',
  'paramount': 'Paramount+',
  'paramount+': 'Paramount+',
  'paramount plus': 'Paramount+',
  'peacock': 'Peacock',
  'showtime': 'Showtime',
  'starz': 'Starz',
  'cinemax': 'Cinemax'
};

function normalizeServiceName(serviceName: string): string {
  const normalized = serviceName.toLowerCase().trim();
  return serviceNameMap[normalized] || serviceName;
}

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

// Fetch from Supabase database first
async function fetchFromDatabase(tmdbId: number, country: string): Promise<StreamingPlatformData[]> {
  try {
    console.log(`Checking database for TMDB ID: ${tmdbId} in region: ${country}`);
    
    const { data, error } = await supabase
      .from('movie_streaming_availability')
      .select(`
        service_id,
        streaming_services!inner(name, logo_url)
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', country.toUpperCase());

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No data found in database');
      return [];
    }

    const services = data.map((item: any) => ({
      service: normalizeServiceName(item.streaming_services.name),
      available: true,
      link: generateServiceLink(item.streaming_services.name),
      logo: item.streaming_services.logo_url || `/streaming-icons/${item.streaming_services.name.toLowerCase()}.svg`,
      type: 'subscription' as const,
      source: 'database'
    }));

    console.log(`Found ${services.length} services in database`);
    return services;
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}

function generateServiceLink(serviceName: string): string {
  const normalized = serviceName.toLowerCase().replace(/[\s+]/g, '');
  
  switch (normalized) {
    case 'netflix':
      return 'https://www.netflix.com';
    case 'primevideo':
    case 'amazon':
    case 'amazonprime':
      return 'https://www.primevideo.com';
    case 'disney+':
    case 'disneyplus':
      return 'https://www.disneyplus.com';
    case 'hulu':
      return 'https://www.hulu.com';
    case 'hbomax':
    case 'max':
      return 'https://play.max.com';
    case 'appletv+':
    case 'appletv':
      return 'https://tv.apple.com';
    case 'paramount+':
      return 'https://www.paramountplus.com';
    default:
      return `https://www.${normalized}.com`;
  }
}

// Implementation using the Streaming Availability API
async function fetchStreamingAvailabilityAPI(
  tmdbId: number,
  title?: string,
  year?: string,
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`Fetching from Streaming Availability API for TMDB ID: ${tmdbId}`);
    
    if (!RAPIDAPI_KEY) {
      console.log('No RapidAPI key available');
      return [];
    }
    
    // Check local memory cache first
    const cacheKey = `${tmdbId}-${country}`;
    if (localCache[cacheKey] && (Date.now() - localCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log('Using memory cached streaming data for:', tmdbId);
      return localCache[cacheKey].data;
    }
    
    // Try direct TMDB ID lookup first
    try {
      const options = {
        method: 'GET',
        url: `https://streaming-availability.p.rapidapi.com/v2/get/movie/${tmdbId}`,
        params: {
          country: country.toLowerCase()
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      };
      
      const response = await retryWithBackoff(() => axios.request(options));
      
      if (response.data?.result?.streamingInfo) {
        console.log('Got streaming info from direct TMDB ID lookup');
        
        const services: StreamingPlatformData[] = [];
        const countryServices = response.data.result.streamingInfo[country.toLowerCase()];
        
        if (countryServices) {
          for (const [service, options] of Object.entries(countryServices)) {
            if (Array.isArray(options) && options.length > 0) {
              services.push({
                service: normalizeServiceName(service),
                available: true,
                link: options[0].link || generateServiceLink(service),
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
    }
    
    // If direct lookup failed and we have title, try title search
    if (title) {
      try {
        console.log('Trying title search with:', title);
        
        const searchOptions = {
          method: 'GET',
          url: 'https://streaming-availability.p.rapidapi.com/v2/search/title',
          params: {
            title: title,
            country: country.toLowerCase(),
            output_language: 'en',
            show_type: 'movie',
            year: year
          },
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        };

        const response = await retryWithBackoff(() => axios.request(searchOptions));
        
        if (response.data && Array.isArray(response.data.result)) {
          const matchingMovie = response.data.result.find((movie: any) => {
            return movie.tmdbId === tmdbId || String(movie.tmdbId) === String(tmdbId);
          });
          
          if (matchingMovie?.streamingInfo?.[country.toLowerCase()]) {
            console.log('Found matching movie in search results');
            
            const services: StreamingPlatformData[] = [];
            const streamingOptions = matchingMovie.streamingInfo[country.toLowerCase()];
            
            for (const [service, options] of Object.entries(streamingOptions)) {
              if (Array.isArray(options) && options.length > 0) {
                services.push({
                  service: normalizeServiceName(service),
                  available: true,
                  link: options[0].link || generateServiceLink(service),
                  logo: `/streaming-icons/${service.toLowerCase()}.svg`,
                  type: options[0].type || 'subscription',
                  source: 'rapid-api-search'
                });
              }
            }
            
            // Cache the result
            localCache[cacheKey] = {
              data: services,
              timestamp: Date.now()
            };
            
            return services;
          }
        }
      } catch (error) {
        console.error('Error with title search:', error);
      }
    }
    
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
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`Getting streaming availability for TMDB ID: ${tmdbId}, country: ${country}`);
    
    // First try database
    const dbResults = await fetchFromDatabase(tmdbId, country);
    if (dbResults.length > 0) {
      console.log(`Found ${dbResults.length} services in database`);
      return dbResults;
    }
    
    // Try Supabase edge function
    try {
      const { data, error } = await supabase.functions.invoke('streaming-availability', {
        body: { tmdbId, country, title, year }
      });
      
      if (!error && data?.result && Array.isArray(data.result) && data.result.length > 0) {
        console.log(`Received ${data.result.length} streaming services from edge function`);
        
        return data.result.map((service: any) => ({
          ...service,
          service: normalizeServiceName(service.service),
          logo: service.logo || `/streaming-icons/${service.service.toLowerCase().replace(/\s+/g, '')}.svg`,
          source: 'edge-function'
        }));
      }
    } catch (error) {
      console.error('Edge function error:', error);
    }
    
    // Try RapidAPI as fallback
    const apiResults = await fetchStreamingAvailabilityAPI(tmdbId, title, year, country);
    if (apiResults.length > 0) {
      console.log(`Found ${apiResults.length} services via RapidAPI`);
      return apiResults;
    }
    
    // Try Watchmode API as last resort
    try {
      const { data, error } = await supabase.functions.invoke('watchmode-availability', {
        body: { tmdbId, region: country.toUpperCase() }
      });
      
      if (!error && data?.sources && Array.isArray(data.sources) && data.sources.length > 0) {
        console.log(`Found ${data.sources.length} services via Watchmode`);
        
        return data.sources.map((source: any) => ({
          service: normalizeServiceName(source.service),
          available: true,
          link: source.link || generateServiceLink(source.service),
          logo: source.logo || `/streaming-icons/default.svg`,
          type: source.type || 'subscription',
          source: 'watchmode'
        }));
      }
    } catch (error) {
      console.error('Watchmode error:', error);
    }
    
    console.log('No streaming services found from any source');
    return [];
  } catch (error) {
    console.error('Error in getStreamingAvailability:', error);
    return [];
  }
}
