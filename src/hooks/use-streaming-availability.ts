
import { useState, useCallback } from "react";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { getTsStreamingAvailability } from "@/services/tsStreamingAvailability";
import type { StreamingPlatformData } from "@/types/streaming";
import i18n from "@/i18n";

/**
 * State interface for streaming availability data
 */
export interface StreamingAvailabilityState {
  services: StreamingPlatformData[];
  isLoading: boolean;
  error: Error | null;
  timestamp: number;
  source: string;
  requested: boolean;
}

/**
 * Hook for fetching streaming availability data for a movie
 * Changed to lazy loading - only fetches when fetchStreamingData is called
 */
export function useStreamingAvailability(tmdbId: number, title?: string, year?: string) {
  const [state, setState] = useState<StreamingAvailabilityState>({
    services: [],
    isLoading: false,
    error: null,
    timestamp: 0,
    source: 'none',
    requested: false
  });

  const currentLang = i18n.language;
  const country = currentLang === 'pl' ? 'pl' : 'us';

  const fetchStreamingData = useCallback(async () => {
    if (!tmdbId || tmdbId <= 0) {
      console.log('[hook] Invalid tmdbId:', tmdbId);
      setState({
        services: [],
        isLoading: false,
        error: new Error('Invalid TMDB ID'),
        timestamp: Date.now(),
        source: 'none',
        requested: true
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, requested: true }));
    
    console.log(`[hook] Fetching streaming availability for TMDB ID: ${tmdbId}, title: ${title}, year: ${year}, country: ${country}`);
    
    try {
      // Try using the TS Streaming Availability API first
      try {
        const tsServices = await getTsStreamingAvailability(tmdbId, country, title);
        if (tsServices && tsServices.length > 0) {
          console.log(`[hook] TS API returned ${tsServices.length} streaming services`);
          
          const newState = {
            services: tsServices.map(service => ({...service, source: 'ts-api'})),
            isLoading: false,
            error: null,
            timestamp: Date.now(),
            source: 'ts-api',
            requested: true
          };
          
          setState(newState);
          console.log(`[hook] Final result: Found ${tsServices.length} streaming services from source: ts-api`);
          return;
        }
      } catch (tsError) {
        console.error('[hook] Error with TS API, trying fallback:', tsError);
      }
      
      // Fall back to our refactored service
      const services = await getStreamingAvailability(tmdbId, title, year, country);
      
      console.log(`[hook] Received ${services.length} streaming services`);
      if (services.length === 0) {
        console.log('[hook] Custom API returned no services');
      }
      
      const newState = {
        services,
        isLoading: false,
        error: null,
        timestamp: Date.now(),
        source: services.length > 0 ? services[0].source || 'api' : 'none',
        requested: true
      };
      
      setState(newState);
      console.log(`[hook] Final result: Found ${services.length} streaming services from source: ${services.length > 0 ? services[0].source || 'api' : 'none'}`);
    } catch (error) {
      console.error('[hook] Error fetching streaming availability:', error);
      setState({
        services: [],
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
        source: 'error',
        requested: true
      });
    }
  }, [tmdbId, title, year, country]);

  return {
    ...state,
    fetchStreamingData
  };
}
