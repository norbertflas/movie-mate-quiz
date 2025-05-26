
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 2;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ERROR_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for errors

// In-memory cache for the current session
const localCache: Record<string, StreamingAvailabilityCache> = {};

// CRITICAL FIX: Always use US region
const FORCE_REGION = 'us';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 1.5);
  }
}

// Fetch from Supabase database first - FORCE US REGION
async function fetchFromDatabase(tmdbId: number): Promise<StreamingPlatformData[]> {
  try {
    console.log(`[DB] Checking database for TMDB ID: ${tmdbId} in region: ${FORCE_REGION}`);
    
    const { data, error } = await supabase
      .from('movie_streaming_availability')
      .select(`
        service_id,
        streaming_services!inner(name, logo_url)
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', FORCE_REGION.toUpperCase());

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

// Main function to get streaming availability - FORCE US REGION
export async function getStreamingAvailability(
  tmdbId: number,
  title?: string,
  year?: string,
  country: string = 'us' // This parameter is ignored - we always use US
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`[MAIN] Getting streaming availability for TMDB ID: ${tmdbId}, forced region: ${FORCE_REGION}, title: ${title}, year: ${year}`);
    
    // Check local memory cache first
    const cacheKey = `${tmdbId}-${FORCE_REGION}`;
    if (localCache[cacheKey]) {
      const cached = localCache[cacheKey];
      const age = Date.now() - cached.timestamp;
      const maxAge = cached.data.length > 0 ? CACHE_DURATION : ERROR_CACHE_DURATION;
      
      if (age < maxAge) {
        console.log('[MAIN] Using memory cached streaming data for:', tmdbId);
        return cached.data;
      } else {
        // Remove expired cache
        delete localCache[cacheKey];
      }
    }
    
    // First try database
    const dbResults = await fetchFromDatabase(tmdbId);
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
      const { data, error } = await retryWithBackoff(async () => {
        return await supabase.functions.invoke('streaming-availability', {
          body: { tmdbId, country: FORCE_REGION, title, year }
        });
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
    
    console.log('[MAIN] No streaming services found from any source');
    
    // Cache empty result with shorter TTL
    localCache[cacheKey] = {
      data: [],
      timestamp: Date.now()
    };
    
    return [];
  } catch (error) {
    console.error('[MAIN] Error in getStreamingAvailability:', error);
    return [];
  }
}
