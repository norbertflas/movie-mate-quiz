
import { useState, useEffect, useCallback, useMemo } from "react";
import { getStreamingAvailabilityBatch, type MovieStreamingData, getUserCountry, getSupportedServices } from "@/services/streamingAvailabilityPro";

export interface StreamingSearchOptions {
  mode: 'instant' | 'lazy';
  selectedServices: string[];
  country?: string;
  enabled?: boolean;
  autoFetch?: boolean;
}

export interface StreamingSearchStats {
  total: number;
  processed: number;
  withStreaming: number;
  loading: boolean;
}

export interface UseSmartStreamingSearchReturn {
  streamingData: Map<number, MovieStreamingData>;
  getStreamingData: (tmdbId: number) => MovieStreamingData | undefined;
  stats: StreamingSearchStats;
  loading: boolean;
  error: string | null;
  fetchBatch: (tmdbIds: number[]) => Promise<void>;
  supportedServices: string[];
  country: string;
}

export const useSmartStreamingSearch = (
  tmdbIds: number[],
  options: StreamingSearchOptions
): UseSmartStreamingSearchReturn => {
  const [streamingData, setStreamingData] = useState<Map<number, MovieStreamingData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(0);

  const country = options.country || getUserCountry();
  const supportedServices = useMemo(() => getSupportedServices(country), [country]);

  const fetchBatch = useCallback(async (ids: number[]) => {
    if (!options.enabled || ids.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching streaming data for ${ids.length} movies in ${options.mode} mode`);
      
      const results = await getStreamingAvailabilityBatch(ids, options.mode, country);

      // Fill missing IDs with explicit "no streaming" entries to avoid infinite refetch loops
      const resultMap = new Map(results.map(result => [result.tmdbId, result]));
      const normalizedResults = ids.map(id =>
        resultMap.get(id) ?? {
          tmdbId: id,
          title: '',
          streamingOptions: [],
          availableServices: [],
          hasStreaming: false,
          lastUpdated: new Date().toISOString()
        }
      );
      
      setStreamingData(prev => {
        const newMap = new Map(prev);
        normalizedResults.forEach(result => {
          newMap.set(result.tmdbId, result);
        });
        return newMap;
      });

      setProcessed(prev => prev + ids.length);
      
    } catch (err) {
      console.error('Error fetching streaming data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch streaming data');
    } finally {
      setLoading(false);
    }
  }, [options.enabled, options.mode, country]);

  // Auto-fetch logic based on mode
  useEffect(() => {
    if (!options.autoFetch || !tmdbIds.length || loading) return;

    // Prevent refetching if we already have most of the data
    const missingIds = tmdbIds.filter(id => !streamingData.has(id));
    if (missingIds.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (options.mode === 'instant') {
        // Instant mode: fetch only missing data
        fetchBatch(missingIds);
      }
    }, 300); // Debounce to prevent rapid refetches

    return () => clearTimeout(timeoutId);
  }, [tmdbIds.join(','), options.autoFetch, options.mode, loading]); // Use join to prevent array reference issues

  // Filter data by selected services
  const filteredData = useMemo(() => {
    if (options.selectedServices.length === 0) return streamingData;

    const filtered = new Map<number, MovieStreamingData>();
    
    streamingData.forEach((data, tmdbId) => {
      const hasSelectedService = data.availableServices.some(service =>
        options.selectedServices.some(selected =>
          service.toLowerCase().includes(selected.toLowerCase()) ||
          selected.toLowerCase().includes(service.toLowerCase())
        )
      );
      
      if (hasSelectedService) {
        filtered.set(tmdbId, data);
      }
    });

    return filtered;
  }, [streamingData, options.selectedServices]);

  const getStreamingData = useCallback((tmdbId: number): MovieStreamingData | undefined => {
    return streamingData.get(tmdbId);
  }, [streamingData]);

  const stats: StreamingSearchStats = useMemo(() => {
    const withStreaming = Array.from(streamingData.values()).filter(data => data.hasStreaming).length;
    
    return {
      total: tmdbIds.length,
      processed,
      withStreaming,
      loading
    };
  }, [tmdbIds.length, processed, streamingData, loading]);

  return {
    streamingData: filteredData,
    getStreamingData,
    stats,
    loading,
    error,
    fetchBatch,
    supportedServices,
    country
  };
};
