
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
const CACHE_VERSION = '1.0';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: StreamingPlatformData[];
  timestamp: number;
  version: string;
}

const getCacheKey = (tmdbId: number, country: string) => 
  `streaming_${tmdbId}_${country}_${CACHE_VERSION}`;

const getFromCache = (key: string): StreamingPlatformData[] | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    
    // Check version and TTL
    if (entry.version !== CACHE_VERSION || 
        Date.now() - entry.timestamp > CACHE_TTL) {
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
      version: CACHE_VERSION
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
  country: string = 'us'
) {
  const [state, setState] = useState<OptimizedStreamingState>({
    services: [],
    isLoading: false,
    error: null,
    source: 'none'
  });

  const { fetchStreamingData } = useBatchStreamingAvailability();
  
  const cacheKey = useMemo(() => 
    getCacheKey(tmdbId, country), [tmdbId, country]
  );

  const fetchData = useCallback(async () => {
    if (!tmdbId || tmdbId <= 0) return;

    // Check cache first
    const cached = getFromCache(cacheKey);
    if (cached) {
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
      const services = await fetchStreamingData(tmdbId, title, year);
      
      // Cache the result
      if (services.length > 0) {
        setToCache(cacheKey, services);
      }

      setState({
        services,
        isLoading: false,
        error: null,
        source: services.length > 0 ? 'api' : 'none'
      });
    } catch (error) {
      setState({
        services: [],
        isLoading: false,
        error: error as Error,
        source: 'error'
      });
    }
  }, [tmdbId, title, year, cacheKey, fetchStreamingData]);

  // Cleanup old cache entries
  useEffect(() => {
    const cleanupCache = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('streaming_')) {
          const cached = getFromCache(key);
          if (!cached) {
            localStorage.removeItem(key);
          }
        }
      });
    };

    // Run cleanup once when component mounts
    cleanupCache();
  }, []);

  return {
    ...state,
    fetchData,
    refetch: fetchData
  };
}
