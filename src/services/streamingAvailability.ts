
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";
import { getMovieWatchProviders } from "./tmdb/movies";
import { getUserRegion } from "@/utils/regionDetection";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 godziny
const ERROR_CACHE_DURATION = 30 * 60 * 1000; // 30 minut dla błędów

// Cache w pamięci z obsługą regionów
const localCache: Record<string, StreamingAvailabilityCache> = {};

// Funkcja retry z exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Normalizacja nazw serwisów z obsługą regionów
function normalizeServiceName(serviceName: string, region: string = 'US'): string {
  if (!serviceName) return 'Unknown';
  
  const serviceMap: Record<string, Record<string, string>> = {
    'US': {
      'netflix': 'Netflix',
      'prime': 'Amazon Prime Video',
      'disney': 'Disney+',
      'hulu': 'Hulu',
      'hbo': 'HBO Max',
      'apple': 'Apple TV+',
      'paramount': 'Paramount+',
      'peacock': 'Peacock',
      'showtime': 'Showtime',
      'starz': 'Starz'
    },
    'PL': {
      'netflix': 'Netflix',
      'prime': 'Amazon Prime Video',
      'disney': 'Disney+',
      'hbo': 'HBO Max',
      'apple': 'Apple TV+',
      'canalplus': 'Canal+',
      'player': 'Player.pl',
      'tvp': 'TVP VOD',
      'polsat': 'Polsat Box Go',
      'nc': 'nc+'
    }
  };
  
  const normalized = serviceName.toLowerCase().trim();
  const regionMap = serviceMap[region.toUpperCase()] || serviceMap['US'];
  return regionMap[normalized] || serviceName;
}

// Główna funkcja z automatyczną detekcją regionu
export async function getStreamingAvailability(
  tmdbId: number,
  title?: string,
  year?: string,
  region?: string
): Promise<StreamingPlatformData[]> {
  try {
    // Auto-detect region if not provided
    const userRegion = region || await getUserRegion();
    console.log(`[getStreamingAvailability] TMDB ID: ${tmdbId}, region: ${userRegion.toUpperCase()}`);
    
    // Cache key uwzględnia region
    const cacheKey = `${tmdbId}-${userRegion.toLowerCase()}`;
    if (localCache[cacheKey]) {
      const cached = localCache[cacheKey];
      const age = Date.now() - cached.timestamp;
      const maxAge = cached.data.length > 0 ? CACHE_DURATION : ERROR_CACHE_DURATION;
      
      if (age < maxAge) {
        console.log(`[getStreamingAvailability] Using cached data for ${userRegion.toUpperCase()} (age: ${Math.round(age / 1000 / 60)}min)`);
        return cached.data;
      } else {
        delete localCache[cacheKey];
      }
    }
    
    // First try TMDB Watch Providers (most reliable)
    console.log('[getStreamingAvailability] Trying TMDB Watch Providers API');
    try {
      const tmdbData = await getMovieWatchProviders(tmdbId, userRegion);
      
      if (tmdbData.services && tmdbData.services.length > 0) {
        console.log(`[getStreamingAvailability] Found ${tmdbData.services.length} services from TMDB for ${userRegion.toUpperCase()}`);
        
        // Transform TMDB data to our format
        const tmdbServices: StreamingPlatformData[] = tmdbData.services.map(service => ({
          service: service.service,
          available: service.available,
          type: service.type as any,
          link: service.link || '#',
          source: 'tmdb',
          logo: service.logo || `/streaming-icons/${service.service?.toLowerCase().replace(/\s+/g, '') || 'unknown'}.svg`
        }));

        // Cache TMDB result
        localCache[cacheKey] = {
          data: tmdbServices,
          timestamp: Date.now()
        };

        return tmdbServices;
      }
    } catch (tmdbError) {
      console.warn('[getStreamingAvailability] TMDB API failed, falling back to legacy API:', tmdbError);
    }
    
    // Fallback to legacy Supabase Edge Function
    console.log('[getStreamingAvailability] Falling back to legacy streaming API');
    
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase.functions.invoke('streaming-availability', {
        body: { 
          tmdbId, 
          country: userRegion.toLowerCase(),
          title: title?.trim(), 
          year: year?.trim() 
        }
      });
    });
    
    if (error) {
      console.error('[getStreamingAvailability] Supabase error:', error);
      throw new Error(`Supabase function error: ${error.message}`);
    }
    
    if (!data) {
      console.log('[getStreamingAvailability] No data received');
      localCache[cacheKey] = { data: [], timestamp: Date.now() };
      return [];
    }
    
    if (data.error) {
      console.error('[getStreamingAvailability] API error:', data.error);
      return [];
    }
    
    const services = data.result || [];
    console.log(`[getStreamingAvailability] Received ${services.length} services from legacy API for ${userRegion.toUpperCase()}`);
    
    if (!Array.isArray(services)) {
      console.error('[getStreamingAvailability] Invalid response format');
      return [];
    }
    
    // Przetwórz i znormalizuj wyniki z uwzględnieniem regionu
    const processedServices: StreamingPlatformData[] = services
      .map((service: any) => ({
        service: normalizeServiceName(service.service, userRegion.toUpperCase()),
        link: service.link || '#',
        available: true,
        type: service.type || 'subscription',
        source: service.source || 'api',
        quality: service.quality || 'hd',
        price: service.price,
        logo: `/streaming-icons/${service.service?.toLowerCase().replace(/\s+/g, '') || 'unknown'}.svg`
      }))
      .filter((service: StreamingPlatformData) => 
        service.service && 
        service.service !== 'Unknown' && 
        service.service.trim() !== ''
      );
    
    // Cache result with region
    localCache[cacheKey] = {
      data: processedServices,
      timestamp: Date.now()
    };
    
    console.log(`[getStreamingAvailability] Final result: ${processedServices.length} services for ${userRegion.toUpperCase()}`);
    
    return processedServices;
    
  } catch (error) {
    console.error('[getStreamingAvailability] Error:', error);
    return [];
  }
}
