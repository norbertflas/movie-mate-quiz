import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StreamingOption {
  service: string;
  serviceLogo: string;
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  quality: string;
  price?: {
    amount: number;
    currency: string;
    formatted: string;
  };
}

export interface MovieStreamingData {
  tmdbId: number;
  title: string;
  streamingOptions: StreamingOption[];
  availableServices: string[];
  hasStreaming: boolean;
  lastUpdated: string;
}

export interface StreamingProResponse {
  success: boolean;
  data: MovieStreamingData[];
  totalProcessed: number;
  totalFound: number;
  mode: 'instant' | 'lazy';
  country: string;
  timestamp: string;
}

export interface UseStreamingProOptions {
  country?: string;
  mode?: 'instant' | 'lazy';
  cacheEnabled?: boolean;
}

export const useStreamingPro = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingData, setStreamingData] = useState<Map<number, MovieStreamingData>>(new Map());

  // Get user's country based on locale
  const getUserCountry = useCallback((): string => {
    const language = navigator.language.toLowerCase();
    const languages = navigator.languages?.map(lang => lang.toLowerCase()) || [];
    
    // Check for Polish
    if (language.includes('pl') || languages.some(lang => lang.includes('pl'))) {
      return 'pl';
    }
    
    // Check timezone as backup
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Warsaw') || timezone.includes('Europe/Warsaw')) {
      return 'pl';
    }
    
    return 'pl'; // Default to Poland for this app
  }, []);

  // Get cached data from localStorage
  const getCachedData = useCallback((tmdbId: number, country: string): MovieStreamingData | null => {
    try {
      const cacheKey = `pro_streaming_cache_${country}_${tmdbId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const data = JSON.parse(cached);
        const expiryTime = new Date(data.expires);
        
        if (expiryTime > new Date()) {
          return data.streamingData;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    
    return null;
  }, []);

  // Save data to localStorage cache
  const setCachedData = useCallback((tmdbId: number, country: string, data: MovieStreamingData) => {
    try {
      const cacheKey = `pro_streaming_cache_${country}_${tmdbId}`;
      const cacheData = {
        streamingData: data,
        expires: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 hours
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error writing cache:', error);
    }
  }, []);

  // Fetch streaming data for multiple movies
  const fetchStreamingData = useCallback(async (
    tmdbIds: number[],
    options: UseStreamingProOptions = {}
  ): Promise<MovieStreamingData[]> => {
    const {
      country = getUserCountry(),
      mode = 'lazy',
      cacheEnabled = true
    } = options;

    if (!tmdbIds || tmdbIds.length === 0) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Check cache first if enabled
      const cachedResults: MovieStreamingData[] = [];
      const uncachedIds: number[] = [];

      if (cacheEnabled) {
        tmdbIds.forEach(tmdbId => {
          const cached = getCachedData(tmdbId, country);
          if (cached) {
            cachedResults.push(cached);
            setStreamingData(prev => new Map(prev.set(tmdbId, cached)));
          } else {
            uncachedIds.push(tmdbId);
          }
        });
      } else {
        uncachedIds.push(...tmdbIds);
      }

      // If all data is cached, return immediately
      if (uncachedIds.length === 0) {
        console.log(`🎬 [Pro] All ${tmdbIds.length} movies found in cache`);
        setLoading(false);
        return cachedResults;
      }

      console.log(`🎬 [Pro] Fetching ${uncachedIds.length} movies (${cachedResults.length} from cache)`);

      // Call the Pro API for uncached data
      const { data, error: apiError } = await supabase.functions.invoke('streaming-availability-pro', {
        body: {
          tmdbIds: uncachedIds,
          country,
          mode
        }
      });

      if (apiError) {
        throw new Error(apiError.message || 'API call failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'API returned error');
      }

      const apiResults: MovieStreamingData[] = data.data || [];

      // Fill missing IDs with explicit empty results so they can be cached too
      const apiResultMap = new Map(apiResults.map(movie => [movie.tmdbId, movie]));
      const normalizedResults = uncachedIds.map(tmdbId =>
        apiResultMap.get(tmdbId) ?? {
          tmdbId,
          title: '',
          streamingOptions: [],
          availableServices: [],
          hasStreaming: false,
          lastUpdated: new Date().toISOString()
        }
      );

      // Cache the normalized results (including empty ones) to stop repeated calls
      if (cacheEnabled) {
        normalizedResults.forEach(movieData => {
          setCachedData(movieData.tmdbId, country, movieData);
          setStreamingData(prev => new Map(prev.set(movieData.tmdbId, movieData)));
        });
      }

      // Combine cached and API results
      const allResults = [...cachedResults, ...normalizedResults];

      console.log(`✅ [Pro] Retrieved streaming data for ${allResults.length}/${tmdbIds.length} movies`);

      setLoading(false);
      return allResults;

    } catch (err: any) {
      console.error('❌ [Pro] Error fetching streaming data:', err);
      setError(err.message || 'Failed to fetch streaming data');
      setLoading(false);
      return [];
    }
  }, [getUserCountry, getCachedData, setCachedData]);

  // Fetch streaming data for a single movie
  const fetchSingleMovie = useCallback(async (
    tmdbId: number,
    options: UseStreamingProOptions = {}
  ): Promise<MovieStreamingData | null> => {
    const results = await fetchStreamingData([tmdbId], options);
    return results.length > 0 ? results[0] : null;
  }, [fetchStreamingData]);

  // Get streaming data from state/cache
  const getStreamingData = useCallback((tmdbId: number): MovieStreamingData | null => {
    return streamingData.get(tmdbId) || null;
  }, [streamingData]);

  // Clear cache for specific movie or all
  const clearCache = useCallback((tmdbId?: number) => {
    if (tmdbId) {
      // Clear specific movie cache
      const country = getUserCountry();
      const cacheKey = `pro_streaming_cache_${country}_${tmdbId}`;
      localStorage.removeItem(cacheKey);
      setStreamingData(prev => {
        const newMap = new Map(prev);
        newMap.delete(tmdbId);
        return newMap;
      });
    } else {
      // Clear all streaming cache
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pro_streaming_cache_')) {
          localStorage.removeItem(key);
        }
      });
      setStreamingData(new Map());
    }
  }, [getUserCountry]);

  // Get available streaming services for filtering
  const getAvailableServices = useCallback((movieIds?: number[]): string[] => {
    const allServices = new Set<string>();
    
    const dataToCheck = movieIds 
      ? movieIds.map(id => streamingData.get(id)).filter(Boolean) as MovieStreamingData[]
      : Array.from(streamingData.values());
    
    dataToCheck.forEach(movie => {
      movie.availableServices.forEach(service => allServices.add(service));
    });
    
    return Array.from(allServices);
  }, [streamingData]);

  return {
    // State
    loading,
    error,
    streamingData,
    
    // Actions
    fetchStreamingData,
    fetchSingleMovie,
    getStreamingData,
    clearCache,
    getAvailableServices,
    getUserCountry,
    
    // Utils
    getCachedData,
    setCachedData
  };
};

export default useStreamingPro;