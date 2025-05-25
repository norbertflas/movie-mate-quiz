
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

// Enhanced service name mapping for consistency
const serviceNameMap: Record<string, string> = {
  'netflix': 'Netflix',
  'amazon': 'Prime Video',
  'amazon prime video': 'Prime Video',
  'amazon prime': 'Prime Video',
  'prime video': 'Prime Video',
  'prime': 'Prime Video',
  'primevideo': 'Prime Video',
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
    console.log(`[DB] Checking database for TMDB ID: ${tmdbId} in region: ${country}`);
    
    const { data, error } = await supabase
      .from('movie_streaming_availability')
      .select(`
        service_id,
        streaming_services!inner(name, logo_url)
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', country.toUpperCase());

    if (error) {
      console.error('[DB] Database error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('[DB] No data found in database');
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

    console.log(`[DB] Found ${services.length} services in database`);
    return services;
  } catch (error) {
    console.error('[DB] Error fetching from database:', error);
    return [];
  }
}

function generateServiceLink(serviceName: string): string {
  const normalized = serviceName.toLowerCase().replace(/[\s+]/g, '');
  
  const linkMap: Record<string, string> = {
    'netflix': 'https://www.netflix.com',
    'primevideo': 'https://www.primevideo.com',
    'amazon': 'https://www.primevideo.com',
    'prime': 'https://www.primevideo.com',
    'disney': 'https://www.disneyplus.com',
    'disneyplus': 'https://www.disneyplus.com',
    'hulu': 'https://www.hulu.com',
    'hbomax': 'https://play.max.com',
    'max': 'https://play.max.com',
    'apple': 'https://tv.apple.com',
    'appletv': 'https://tv.apple.com',
    'paramount': 'https://www.paramountplus.com',
    'paramountplus': 'https://www.paramountplus.com'
  };
  
  return linkMap[normalized] || `https://www.${normalized}.com`;
}

// Main function to get streaming availability
export async function getStreamingAvailability(
  tmdbId: number,
  title?: string,
  year?: string,
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`[MAIN] Getting streaming availability for TMDB ID: ${tmdbId}, country: ${country}, title: ${title}, year: ${year}`);
    
    // Check local memory cache first
    const cacheKey = `${tmdbId}-${country}`;
    if (localCache[cacheKey] && (Date.now() - localCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log('[MAIN] Using memory cached streaming data for:', tmdbId);
      return localCache[cacheKey].data;
    }
    
    // First try database
    const dbResults = await fetchFromDatabase(tmdbId, country);
    if (dbResults.length > 0) {
      console.log(`[MAIN] Found ${dbResults.length} services in database`);
      // Cache the result
      localCache[cacheKey] = {
        data: dbResults,
        timestamp: Date.now()
      };
      return dbResults;
    }
    
    // Try Supabase edge function with enhanced error handling
    try {
      console.log('[MAIN] Trying Supabase edge function');
      const { data, error } = await supabase.functions.invoke('streaming-availability', {
        body: { tmdbId, country, title, year }
      });
      
      if (!error && data?.result && Array.isArray(data.result) && data.result.length > 0) {
        console.log(`[MAIN] Received ${data.result.length} streaming services from edge function`);
        
        const processedResults = data.result.map((service: any) => ({
          ...service,
          service: normalizeServiceName(service.service),
          logo: service.logo || `/streaming-icons/${service.service.toLowerCase().replace(/\s+/g, '')}.svg`,
          source: 'edge-function'
        }));
        
        // Cache the result
        localCache[cacheKey] = {
          data: processedResults,
          timestamp: Date.now()
        };
        
        return processedResults;
      } else if (error) {
        console.error('[MAIN] Edge function error:', error);
      }
    } catch (error) {
      console.error('[MAIN] Edge function error:', error);
    }
    
    // Try RapidAPI directly as fallback
    if (RAPIDAPI_KEY) {
      try {
        console.log('[MAIN] Trying RapidAPI directly');
        const apiResults = await fetchStreamingAvailabilityAPI(tmdbId, title, year, country);
        if (apiResults.length > 0) {
          console.log(`[MAIN] Found ${apiResults.length} services via RapidAPI`);
          // Cache the result
          localCache[cacheKey] = {
            data: apiResults,
            timestamp: Date.now()
          };
          return apiResults;
        }
      } catch (error) {
        console.error('[MAIN] RapidAPI error:', error);
      }
    }
    
    // Try Watchmode API as last resort
    try {
      console.log('[MAIN] Trying Watchmode API');
      const { data, error } = await supabase.functions.invoke('watchmode-availability', {
        body: { tmdbId, region: country.toUpperCase() }
      });
      
      if (!error && data?.sources && Array.isArray(data.sources) && data.sources.length > 0) {
        console.log(`[MAIN] Found ${data.sources.length} services via Watchmode`);
        
        const watchmodeResults = data.sources.map((source: any) => ({
          service: normalizeServiceName(source.service),
          available: true,
          link: source.link || generateServiceLink(source.service),
          logo: source.logo || `/streaming-icons/default.svg`,
          type: source.type || 'subscription',
          source: 'watchmode'
        }));
        
        // Cache the result
        localCache[cacheKey] = {
          data: watchmodeResults,
          timestamp: Date.now()
        };
        
        return watchmodeResults;
      }
    } catch (error) {
      console.error('[MAIN] Watchmode error:', error);
    }
    
    console.log('[MAIN] No streaming services found from any source');
    return [];
  } catch (error) {
    console.error('[MAIN] Error in getStreamingAvailability:', error);
    return [];
  }
}

// Implementation using the Streaming Availability API directly
async function fetchStreamingAvailabilityAPI(
  tmdbId: number,
  title?: string,
  year?: string,
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`[API] Fetching from Streaming Availability API for TMDB ID: ${tmdbId}`);
    
    if (!RAPIDAPI_KEY) {
      console.log('[API] No RapidAPI key available');
      return [];
    }
    
    // Try multiple API versions and endpoints
    const endpoints = [
      {
        name: 'v4-direct',
        url: `https://streaming-availability.p.rapidapi.com/v4/shows/movie/${tmdbId}`,
        params: { country: country.toLowerCase() }
      },
      {
        name: 'v3-direct', 
        url: `https://streaming-availability.p.rapidapi.com/v3/movie/${tmdbId}`,
        params: { country: country.toLowerCase() }
      }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const queryParams = new URLSearchParams(endpoint.params);
        const fullUrl = `${endpoint.url}?${queryParams.toString()}`;
        
        const options = {
          method: 'GET',
          url: fullUrl,
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        };
        
        const response = await retryWithBackoff(() => axios.request(options));
        
        if (response.data) {
          console.log(`[API] Got response from ${endpoint.name}`);
          
          let streamingInfo = null;
          if (response.data.streamingInfo) {
            streamingInfo = response.data.streamingInfo;
          } else if (response.data.result?.streamingInfo) {
            streamingInfo = response.data.result.streamingInfo;
          }
          
          if (streamingInfo?.[country.toLowerCase()]) {
            const services: StreamingPlatformData[] = [];
            const countryServices = streamingInfo[country.toLowerCase()];
            
            for (const [service, options] of Object.entries(countryServices)) {
              if (Array.isArray(options) && options.length > 0) {
                services.push({
                  service: normalizeServiceName(service),
                  available: true,
                  link: options[0].link || generateServiceLink(service),
                  logo: `/streaming-icons/${service.toLowerCase()}.svg`,
                  type: options[0].type || 'subscription',
                  source: endpoint.name
                });
              }
            }
            
            if (services.length > 0) {
              console.log(`[API] Found ${services.length} services via ${endpoint.name}`);
              return services;
            }
          }
        }
      } catch (error) {
        console.error(`[API] Error with ${endpoint.name}:`, error);
        continue;
      }
    }
    
    // If direct lookups failed and we have title, try title search
    if (title) {
      try {
        console.log('[API] Trying title search with:', title);
        
        // Define proper interface for search parameters
        interface SearchParams {
          query: string;
          country: string;
          type: string;
          output_language: string;
          year?: string;
        }
        
        const searchParams: SearchParams = {
          query: title,
          country: country.toLowerCase(),
          type: 'movie',
          output_language: 'en'
        };

        if (year) {
          searchParams.year = year;
        }

        const searchOptions = {
          method: 'GET',
          url: 'https://streaming-availability.p.rapidapi.com/v4/search',
          params: searchParams,
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        };

        const response = await retryWithBackoff(() => axios.request(searchOptions));
        
        if (response.data?.matches && Array.isArray(response.data.matches)) {
          const matchingMovie = response.data.matches.find((movie: any) => {
            return movie.tmdbId === tmdbId || String(movie.tmdbId) === String(tmdbId);
          }) || response.data.matches[0];
          
          if (matchingMovie?.streamingInfo?.[country.toLowerCase()]) {
            console.log('[API] Found matching movie in search results');
            
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
                  source: 'api-search'
                });
              }
            }
            
            if (services.length > 0) {
              console.log(`[API] Found ${services.length} services via title search`);
              return services;
            }
          }
        }
      } catch (error) {
        console.error('[API] Error with title search:', error);
      }
    }
    
    return [];
  } catch (error) {
    console.error('[API] Error fetching streaming availability:', error);
    return [];
  }
}
