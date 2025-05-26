
import { useState, useCallback } from "react";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import type { StreamingPlatformData } from "@/types/streaming";

export interface StreamingAvailabilityState {
  services: StreamingPlatformData[];
  isLoading: boolean;
  error: Error | null;
  timestamp: number;
  source: string;
  requested: boolean;
  links: Record<string, string>;
}

export function useStreamingAvailability(tmdbId: number, title?: string, year?: string) {
  const [state, setState] = useState<StreamingAvailabilityState>({
    services: [],
    isLoading: false,
    error: null,
    timestamp: 0,
    source: 'none',
    requested: false,
    links: {}
  });

  const forceRegion = 'us';

  const fetchStreamingData = useCallback(async () => {
    if (!tmdbId || tmdbId <= 0) {
      console.log('[useStreamingAvailability] Invalid tmdbId:', tmdbId);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: new Error('Invalid TMDB ID'),
        timestamp: Date.now(),
        source: 'none',
        requested: true
      }));
      return;
    }

    if (state.isLoading) {
      console.log('[useStreamingAvailability] Already loading, skipping...');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, requested: true, error: null }));
    
    console.log(`[useStreamingAvailability] Fetching for TMDB ID: ${tmdbId}, region: ${forceRegion}`);
    
    try {
      const services = await getStreamingAvailability(tmdbId, title, year, forceRegion);
      
      console.log(`[useStreamingAvailability] Received ${services.length} streaming services`);
      
      const links: Record<string, string> = {};
      services.forEach(service => {
        if (service.link && service.link !== '#') {
          links[service.service] = service.link;
        }
      });
      
      setState({
        services,
        isLoading: false,
        error: null,
        timestamp: Date.now(),
        source: services.length > 0 ? services[0].source || 'api' : 'none',
        requested: true,
        links
      });
      
      if (services.length > 0) {
        console.log('[useStreamingAvailability] Services found:', 
          services.map(s => `${s.service} (${s.type})`).join(', ')
        );
      } else {
        console.log('[useStreamingAvailability] No streaming services found');
      }
    } catch (error: any) {
      console.error('[useStreamingAvailability] Error:', error);
      
      setState({
        services: [],
        isLoading: false,
        error: new Error(error.message || 'Failed to fetch streaming availability'),
        timestamp: Date.now(),
        source: 'error',
        requested: true,
        links: {}
      });
    }
  }, [tmdbId, title, year, forceRegion, state.isLoading]);

  const refetch = useCallback(() => {
    console.log('[useStreamingAvailability] Refetching data...');
    setState(prev => ({
      ...prev,
      requested: false,
      error: null,
      isLoading: false
    }));
    fetchStreamingData();
  }, [fetchStreamingData]);

  return {
    ...state,
    fetchData: fetchStreamingData,
    refetch
  };
}
