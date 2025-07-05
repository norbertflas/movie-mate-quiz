
import { useState, useEffect, useCallback, useMemo } from "react";
import { getStreamingAvailabilityBatch, type MovieStreamingData } from "@/services/streamingAvailabilityPro";
import { useToast } from "@/hooks/use-toast";

export interface EnhancedStreamingSearchOptions {
  mode: 'instant' | 'lazy';
  selectedServices: string[];
  country?: string;
  enabled?: boolean;
  autoFetch?: boolean;
  retryAttempts?: number;
}

export interface EnhancedStreamingSearchReturn {
  streamingData: Map<number, MovieStreamingData>;
  getStreamingData: (tmdbId: number) => MovieStreamingData | undefined;
  stats: {
    total: number;
    processed: number;
    withStreaming: number;
    loading: boolean;
    errors: number;
  };
  loading: boolean;
  error: string | null;
  fetchBatch: (tmdbIds: number[]) => Promise<void>;
  retryFailed: () => Promise<void>;
  supportedServices: string[];
  country: string;
}

export const useEnhancedStreamingSearch = (
  tmdbIds: number[],
  options: EnhancedStreamingSearchOptions
): EnhancedStreamingSearchReturn => {
  const [streamingData, setStreamingData] = useState<Map<number, MovieStreamingData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [failedIds, setFailedIds] = useState<number[]>([]);
  const { toast } = useToast();

  const country = options.country || 'us';
  const retryAttempts = options.retryAttempts || 3;

  const fetchBatch = useCallback(async (ids: number[], attempt: number = 1) => {
    if (!options.enabled || ids.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`[Enhanced Streaming Search] Fetching batch of ${ids.length} movies (attempt ${attempt})`);
      
      const results = await getStreamingAvailabilityBatch(ids, options.mode, country);
      
      setStreamingData(prev => {
        const newMap = new Map(prev);
        results.forEach(result => {
          newMap.set(result.tmdbId, result);
        });
        return newMap;
      });

      setProcessed(prev => prev + results.length);
      
      // Remove successfully processed IDs from failed list
      setFailedIds(prev => prev.filter(id => !results.some(r => r.tmdbId === id)));
      
      console.log(`[Enhanced Streaming Search] Successfully processed ${results.length}/${ids.length} movies`);
      
      if (results.length !== ids.length && attempt < retryAttempts) {
        const failedThisTime = ids.filter(id => !results.some(r => r.tmdbId === id));
        console.log(`[Enhanced Streaming Search] Retrying ${failedThisTime.length} failed movies`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        await fetchBatch(failedThisTime, attempt + 1);
      } else if (results.length !== ids.length) {
        const finalFailed = ids.filter(id => !results.some(r => r.tmdbId === id));
        setFailedIds(prev => [...new Set([...prev, ...finalFailed])]);
        setErrors(prev => prev + finalFailed.length);
      }
      
    } catch (err) {
      console.error('[Enhanced Streaming Search] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch streaming data';
      setError(errorMessage);
      
      if (attempt < retryAttempts) {
        console.log(`[Enhanced Streaming Search] Retrying after error (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
        await fetchBatch(ids, attempt + 1);
      } else {
        setFailedIds(prev => [...new Set([...prev, ...ids])]);
        setErrors(prev => prev + ids.length);
        
        toast({
          title: "Streaming data error",
          description: `Failed to fetch streaming data: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [options.enabled, options.mode, country, retryAttempts, toast]);

  const retryFailed = useCallback(async () => {
    if (failedIds.length > 0) {
      console.log(`[Enhanced Streaming Search] Retrying ${failedIds.length} failed movies`);
      await fetchBatch(failedIds);
    }
  }, [failedIds, fetchBatch]);

  // Auto-fetch logic
  useEffect(() => {
    if (!options.autoFetch || !tmdbIds.length) return;

    const delay = options.mode === 'instant' ? 100 : 1000;
    const timeoutId = setTimeout(() => {
      fetchBatch(tmdbIds);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [tmdbIds, options.autoFetch, options.mode, fetchBatch]);

  const getStreamingData = useCallback((tmdbId: number): MovieStreamingData | undefined => {
    return streamingData.get(tmdbId);
  }, [streamingData]);

  const stats = useMemo(() => {
    const withStreaming = Array.from(streamingData.values()).filter(data => data.hasStreaming).length;
    
    return {
      total: tmdbIds.length,
      processed,
      withStreaming,
      loading,
      errors
    };
  }, [tmdbIds.length, processed, streamingData, loading, errors]);

  return {
    streamingData,
    getStreamingData,
    stats,
    loading,
    error,
    fetchBatch,
    retryFailed,
    supportedServices: ['Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Hulu'],
    country
  };
};
