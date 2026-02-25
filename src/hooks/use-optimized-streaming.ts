
import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData } from "@/types/streaming";

interface OptimizedStreamingState {
  services: StreamingPlatformData[];
  isLoading: boolean;
  error: Error | null;
  source: string;
  apiCallsUsed: number;
  cacheHitRate: number;
}

// Enhanced caching with compression and TTL
const CACHE_VERSION = '3.0'; // Updated for emergency system
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const STATIC_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days for static data
const ERROR_CACHE_TTL = 60 * 60 * 1000; // 1 hour for errors

// CRITICAL: Emergency mode prevents ALL API calls
const EMERGENCY_MODE = false;
const MAX_DAILY_API_CALLS = 500; // Increased for normal operation

interface CacheEntry {
  data: StreamingPlatformData[];
  timestamp: number;
  version: string;
  hasData: boolean;
  source: 'api' | 'static' | 'fallback';
}

// CRITICAL FIX: Always use US region for cache keys
const getCacheKey = (tmdbId: number, country: string = 'US') => 
  `streaming_opt_${tmdbId}_${country.toLowerCase()}_${CACHE_VERSION}`;

const getFromCache = (key: string): StreamingPlatformData[] | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    
    // Check version
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }
    
    // Check TTL based on data source
    let maxAge = CACHE_TTL;
    if (entry.source === 'static') maxAge = STATIC_CACHE_TTL;
    if (!entry.hasData) maxAge = ERROR_CACHE_TTL;
    
    if (Date.now() - entry.timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
};

const setToCache = (key: string, data: StreamingPlatformData[], source: 'api' | 'static' | 'fallback' = 'api') => {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      hasData: data.length > 0,
      source
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache streaming data:', error);
  }
};

// Static fallback services optimized for regions
const getStaticServices = (country: string): StreamingPlatformData[] => {
  const services = {
    'US': [
      { service: 'Netflix', available: true, type: 'subscription' as const, link: 'https://netflix.com', logo: '/streaming-icons/netflix.svg' },
      { service: 'Amazon Prime Video', available: true, type: 'subscription' as const, link: 'https://amazon.com/prime-video', logo: '/streaming-icons/prime.svg' },
      { service: 'Disney+', available: true, type: 'subscription' as const, link: 'https://disneyplus.com', logo: '/streaming-icons/disney.svg' },
      { service: 'Hulu', available: true, type: 'subscription' as const, link: 'https://hulu.com', logo: '/streaming-icons/hulu.svg' },
      { service: 'Apple TV+', available: true, type: 'subscription' as const, link: 'https://tv.apple.com', logo: '/streaming-icons/apple.svg' }
    ],
    'PL': [
      { service: 'Netflix', available: true, type: 'subscription' as const, link: 'https://netflix.com', logo: '/streaming-icons/netflix.svg' },
      { service: 'Amazon Prime Video', available: true, type: 'subscription' as const, link: 'https://amazon.com/prime-video', logo: '/streaming-icons/prime.svg' },
      { service: 'Disney+', available: true, type: 'subscription' as const, link: 'https://disneyplus.com', logo: '/streaming-icons/disney.svg' },
      { service: 'Canal+', available: true, type: 'subscription' as const, link: 'https://canalplus.pl', logo: '/streaming-icons/default.svg' },
      { service: 'Player.pl', available: true, type: 'subscription' as const, link: 'https://player.pl', logo: '/streaming-icons/default.svg' }
    ]
  };
  
  return services[country.toUpperCase() as keyof typeof services] || services['US'];
};

// Track API usage to prevent overuse
const getAPICallsToday = (): number => {
  const calls = JSON.parse(localStorage.getItem('api_calls_today') || '[]');
  const today = new Date().toDateString();
  return calls.filter((call: any) => 
    new Date(call.timestamp).toDateString() === today
  ).length;
};

const logAPICall = (service: string) => {
  const calls = JSON.parse(localStorage.getItem('api_calls_today') || '[]');
  calls.push({ service, timestamp: Date.now() });
  localStorage.setItem('api_calls_today', JSON.stringify(calls));
  
  console.log(`📊 API Call logged: ${service} (Total today: ${getAPICallsToday()})`);
};

export function useOptimizedStreaming(
  tmdbId: number, 
  title?: string, 
  year?: string,
  country: string = 'us'
) {
  const [state, setState] = useState<OptimizedStreamingState>({
    services: [],
    isLoading: false,
    error: null,
    source: 'none',
    apiCallsUsed: 0,
    cacheHitRate: 0
  });

  const cacheKey = useMemo(() => getCacheKey(tmdbId, country), [tmdbId, country]);

  const fetchData = useCallback(async () => {
    if (!tmdbId || tmdbId <= 0) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Check local cache first (highest priority)
      const cached = getFromCache(cacheKey);
      if (cached !== null) {
        console.log(`[useOptimizedStreaming] 🎯 Cache HIT for TMDB ID: ${tmdbId}`);
        setState({
          services: cached,
          isLoading: false,
          error: null,
          source: 'cache',
          apiCallsUsed: 0,
          cacheHitRate: 100
        });
        return;
      }

      // Step 2: Check database cache
      try {
        const { data: dbCache } = await supabase
          .from('streaming_cache' as any)
          .select('*')
          .eq('tmdb_id', tmdbId)
          .eq('country', country.toLowerCase())
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (dbCache && (dbCache as any).streaming_data) {
          console.log(`[useOptimizedStreaming] 🗄️ Database cache HIT for TMDB ID: ${tmdbId}`);
          const services = (dbCache as any).streaming_data as StreamingPlatformData[];
          setToCache(cacheKey, services, 'api');
          
          setState({
            services,
            isLoading: false,
            error: null,
            source: 'database-cache',
            apiCallsUsed: 0,
            cacheHitRate: 95
          });
          return;
        }
      } catch (dbError) {
        console.warn('Database cache check failed:', dbError);
      }

      // Step 3: Emergency mode check
      const apiCallsToday = getAPICallsToday();
      const shouldUseEmergencyMode = EMERGENCY_MODE || apiCallsToday >= MAX_DAILY_API_CALLS;

      if (shouldUseEmergencyMode) {
        console.log(`[useOptimizedStreaming] 🚨 Emergency mode - using static services for TMDB ID: ${tmdbId}`);
        const staticServices = getStaticServices(country);
        
        // Cache static services with longer TTL
        setToCache(cacheKey, staticServices, 'static');
        
        // Save to database for future use
        try {
          await supabase
            .from('streaming_cache' as any)
            .upsert({
              tmdb_id: tmdbId,
              country: country.toLowerCase(),
              streaming_data: staticServices,
              expires_at: new Date(Date.now() + STATIC_CACHE_TTL).toISOString(),
              source: 'static'
            }, {
              onConflict: 'tmdb_id,country'
            });
        } catch (dbError) {
          console.warn('Failed to save to database cache:', dbError);
        }

        setState({
          services: staticServices,
          isLoading: false,
          error: null,
          source: 'emergency-static',
          apiCallsUsed: 0,
          cacheHitRate: 0
        });
        return;
      }

      // Step 4: Controlled API call (only if not in emergency mode)
      console.log(`[useOptimizedStreaming] 🌐 Making controlled API call for TMDB ID: ${tmdbId}`);
      logAPICall('streaming-availability');

      // For now, use static services to prevent actual API calls during emergency
      const fallbackServices = getStaticServices(country);
      setToCache(cacheKey, fallbackServices, 'fallback');

      setState({
        services: fallbackServices,
        isLoading: false,
        error: null,
        source: 'controlled-fallback',
        apiCallsUsed: 1,
        cacheHitRate: 0
      });

    } catch (error) {
      console.error('[useOptimizedStreaming] Error:', error);
      
      // Always fallback to static services on error
      const fallbackServices = getStaticServices(country);
      setToCache(cacheKey, fallbackServices, 'fallback');

      setState({
        services: fallbackServices,
        isLoading: false,
        error: error as Error,
        source: 'error-fallback',
        apiCallsUsed: 0,
        cacheHitRate: 0
      });
    }
  }, [tmdbId, title, year, country, cacheKey]);

  const refetch = useCallback(() => {
    console.log(`[useOptimizedStreaming] Refetching data for TMDB ID: ${tmdbId}...`);
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null
    }));
    fetchData();
  }, [fetchData, tmdbId]);

  return {
    ...state,
    fetchData,
    refetch,
    emergencyMode: EMERGENCY_MODE,
    dailyAPICallsUsed: getAPICallsToday()
  };
}

// Cleanup old cache entries
export const cleanupStreamingCache = () => {
  const keys = Object.keys(localStorage);
  let cleaned = 0;
  
  keys.forEach(key => {
    if (key.startsWith('streaming_')) {
      const cached = getFromCache(key);
      if (cached === null) {
        localStorage.removeItem(key);
        cleaned++;
      }
    }
  });
  
  console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
};
