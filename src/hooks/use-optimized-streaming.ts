
import { useState, useCallback, useEffect, useMemo } from "react";
import { useBatchStreamingAvailability } from "./use-batch-streaming-availability";
import type { StreamingPlatformData } from "@/types/streaming";

interface OptimizedStreamingState {
  services: StreamingPlatformData[];
  isLoading: boolean;
  error: Error | null;
  source: string;
}

// Enhanced caching with compression and TTL
const CACHE_VERSION = '2.0'; // Updated cache version
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ERROR_CACHE_TTL = 60 * 60 * 1000; // 1 hour for errors

interface CacheEntry {
  data: StreamingPlatformData[];
  timestamp: number;
  version: string;
  hasData: boolean;
}

// CRITICAL FIX: Always use US region for cache keys
const getCacheKey = (tmdbId: number) => 
  `streaming_${tmdbId}_us_${CACHE_VERSION}`;

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
    
    // Check TTL based on whether we have data or not
    const maxAge = entry.hasData ? CACHE_TTL : ERROR_CACHE_TTL;
    if (Date.now() - entry.timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
};

const setToCache = (key: string, data: StreamingPlatformData[]) => {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      hasData: data.length > 0
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache streaming data:', error);
  }
};

export function useOptimizedStreaming(
  tmdbId: number, 
  title?: string, 
  year?: string,
  country: string = 'us' // This parameter is ignored - we always use US
) {
  const [state, setState] = useState<OptimizedStreamingState>({
    services: [],
    isLoading: false,
    error: null,
    source: 'none'
  });

  const { fetchStreamingData } = useBatchStreamingAvailability();
  
  // Always use US for cache key
  const cacheKey = useMemo(() => 
    getCacheKey(tmdbId), [tmdbId]
  );

  const fetchData = useCallback(async () => {
    if (!tmdbId || tmdbId <= 0) return;

    // Check cache first
    const cached = getFromCache(cacheKey);
    if (cached !== null) {
      console.log(`[useOptimizedStreaming] Using cached data for TMDB ID: ${tmdbId}, found ${cached.length} services`);
      setState({
        services: cached,
        isLoading: false,
        error: null,
        source: 'cache'
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`[useOptimizedStreaming] Fetching streaming data for TMDB ID: ${tmdbId}, title: ${title}, year: ${year}`);
      const services = await fetchStreamingData(tmdbId, title, year);
      
      console.log(`[useOptimizedStreaming] Received ${services.length} services`);
      
      // Always cache the result (even if empty) with appropriate TTL
      setToCache(cacheKey, services);

      setState({
        services,
        isLoading: false,
        error: null,
        source: services.length > 0 ? 'api' : 'none'
      });
    } catch (error) {
      console.error('[useOptimizedStreaming] Error fetching streaming data:', error);
      setState({
        services: [],
        isLoading: false,
        error: error as Error,
        source: 'error'
      });
      
      // Cache empty result with shorter TTL
      setToCache(cacheKey, []);
    }
  }, [tmdbId, title, year, cacheKey, fetchStreamingData]);

  // Cleanup old cache entries
  useEffect(() => {
    const cleanupCache = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('streaming_')) {
          const cached = getFromCache(key);
          if (cached === null) {
            localStorage.removeItem(key);
          }
        }
      });
    };

    cleanupCache();
  }, []);

  return {
    ...state,
    fetchData,
    refetch: fetchData
  };
}
