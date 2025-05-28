
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface StreamingOption {
  service: string;
  serviceLogo?: string;
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  quality: string;
  price?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  audios: string[];
  subtitles: string[];
}

interface StreamingData {
  tmdbId: number;
  title: string;
  year: number;
  streamingOptions: StreamingOption[];
  availableServices: string[];
  hasStreaming: boolean;
  posterUrl?: string;
  lastUpdated: number;
  fetchTime?: number;
}

interface SmartStreamingOptions {
  mode: 'instant' | 'lazy'; // instant = search pages, lazy = categories/homepage
  selectedServices?: string[]; // priority services for filtering
  country?: string;
  enabled?: boolean;
  autoFetch?: boolean;
}

export function useSmartStreamingSearch(
  tmdbIds: number[],
  options: SmartStreamingOptions = { mode: 'lazy' } // Provide default mode
) {
  const { i18n } = useTranslation();
  const {
    mode = 'lazy',
    selectedServices = [],
    country = i18n.language === 'pl' ? 'pl' : 'us',
    enabled = true,
    autoFetch = true
  } = options;

  const [data, setData] = useState<Record<number, StreamingData>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<Record<number, string>>({});

  // Cache management with shorter TTL for instant mode
  const CACHE_TTL = mode === 'instant' ? 
    2 * 60 * 60 * 1000 : // 2 hours for search
    6 * 60 * 60 * 1000;  // 6 hours for categories

  // Load cache on mount
  useEffect(() => {
    const loadCache = () => {
      try {
        const cacheKey = `smart_streaming_${country}_${mode}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const parsedCache = JSON.parse(cached);
          const now = Date.now();
          
          const validCache: Record<number, StreamingData> = {};
          Object.entries(parsedCache).forEach(([key, value]: [string, any]) => {
            if (value.lastUpdated && (now - value.lastUpdated) < CACHE_TTL) {
              validCache[parseInt(key)] = value;
            }
          });
          
          if (Object.keys(validCache).length > 0) {
            setData(validCache);
            console.log(`📦 Loaded ${Object.keys(validCache).length} items from cache (${mode} mode)`);
          }
        }
      } catch (error) {
        console.error('Cache load error:', error);
      }
    };
    
    loadCache();
  }, [country, mode, CACHE_TTL]);

  // Save to cache
  const saveToCache = useCallback((newData: Record<number, StreamingData>) => {
    try {
      const cacheKey = `smart_streaming_${country}_${mode}`;
      localStorage.setItem(cacheKey, JSON.stringify(newData));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }, [country, mode]);

  // Fetch streaming data
  const fetchStreamingData = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;

    console.log(`🔍 Smart streaming fetch: ${ids.length} movies (${mode} mode, country: ${country})`);
    
    setLoading(true);
    setProgress({ current: 0, total: ids.length });
    
    const startTime = Date.now();
    
    try {
      const { data: response, error } = await supabase.functions.invoke(
        'streaming-availability',
        {
          body: {
            tmdbIds: ids,
            country: country.toLowerCase(),
            mode: mode === 'instant' ? 'aggressive' : 'standard'
          }
        }
      );

      if (error) throw error;

      if (response?.results) {
        const newData = { ...data };
        const fetchTime = Date.now() - startTime;
        
        response.results.forEach((result: any) => {
          if (result.data) {
            newData[result.tmdbId] = {
              tmdbId: result.tmdbId,
              title: result.data.title || `Movie ${result.tmdbId}`,
              year: result.data.year || new Date().getFullYear(),
              streamingOptions: result.data.streamingOptions?.map((option: any) => ({
                service: option.service || 'Unknown',
                serviceLogo: `/streaming-icons/${(option.service || 'unknown').toLowerCase().replace(/\s+/g, '')}.svg`,
                link: option.link || '#',
                type: option.type || 'subscription',
                quality: option.quality || 'hd',
                price: option.price,
                audios: option.audios || [],
                subtitles: option.subtitles || []
              })) || [],
              availableServices: result.data.streamingOptions?.map((option: any) => option.service) || [],
              hasStreaming: (result.data.streamingOptions?.length || 0) > 0,
              posterUrl: result.data.posterUrl,
              lastUpdated: Date.now(),
              fetchTime
            };
          }
        });

        setData(newData);
        saveToCache(newData);
        setProgress({ current: response.results.length, total: ids.length });
        
        console.log(`✅ Smart fetch completed: ${response.results.length}/${ids.length} in ${fetchTime}ms`);
      }

    } catch (error: any) {
      console.error('Smart streaming fetch error:', error);
      
      const newErrors = { ...errors };
      ids.forEach(id => {
        newErrors[id] = error.message || 'Fetch failed';
      });
      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  }, [data, errors, country, mode, saveToCache]);

  // Auto-fetch logic based on mode
  useEffect(() => {
    if (!enabled || !autoFetch || tmdbIds.length === 0) return;

    const now = Date.now();
    const missingIds = tmdbIds.filter(id => {
      const cached = data[id];
      if (!cached) return true;
      
      const isStale = (now - cached.lastUpdated) > CACHE_TTL;
      return isStale;
    });

    if (missingIds.length > 0) {
      // For instant mode (search), fetch immediately
      // For lazy mode (categories), only fetch if explicitly requested
      if (mode === 'instant') {
        fetchStreamingData(missingIds);
      }
    }
  }, [tmdbIds, enabled, autoFetch, data, fetchStreamingData, mode, CACHE_TTL]);

  // Filter by selected services
  const filteredData = useMemo(() => {
    if (selectedServices.length === 0) return data;
    
    const filtered: Record<number, StreamingData> = {};
    Object.entries(data).forEach(([key, value]) => {
      const hasSelectedService = selectedServices.some(service => 
        value.availableServices.some(available => 
          available.toLowerCase().includes(service.toLowerCase()) ||
          service.toLowerCase().includes(available.toLowerCase())
        )
      );
      
      if (hasSelectedService) {
        filtered[parseInt(key)] = value;
      }
    });
    
    return filtered;
  }, [data, selectedServices]);

  // Get best streaming option for a movie
  const getBestOption = useCallback((tmdbId: number) => {
    const movie = data[tmdbId];
    if (!movie?.streamingOptions.length) return null;
    
    // Priority: subscription > free > rent > buy
    const priorities = { subscription: 4, free: 3, rent: 2, buy: 1 };
    return movie.streamingOptions.sort((a, b) => 
      (priorities[b.type] || 0) - (priorities[a.type] || 0)
    )[0];
  }, [data]);

  return {
    // Data
    data: selectedServices.length > 0 ? filteredData : data,
    loading,
    progress,
    errors,
    
    // Actions
    fetchData: fetchStreamingData,
    refresh: (ids?: number[]) => {
      const idsToRefresh = ids || tmdbIds;
      fetchStreamingData(idsToRefresh);
    },
    
    // Helpers
    getStreamingData: (tmdbId: number) => data[tmdbId],
    hasStreaming: (tmdbId: number) => data[tmdbId]?.hasStreaming || false,
    getServices: (tmdbId: number) => data[tmdbId]?.availableServices || [],
    getBestOption,
    isLoading: (tmdbId: number) => loading && !data[tmdbId],
    hasError: (tmdbId: number) => !!errors[tmdbId],
    
    // Stats
    stats: {
      total: tmdbIds.length,
      cached: tmdbIds.filter(id => data[id]).length,
      withStreaming: tmdbIds.filter(id => data[id]?.hasStreaming).length,
      errors: Object.keys(errors).length
    }
  };
}
