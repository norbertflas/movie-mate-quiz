
import { useState, useCallback } from "react";
import { getStreamingAvailability } from "@/services/streamingAvailability";
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
  links: Record<string, string>;
}

/**
 * Hook for fetching streaming availability data for a movie
 * Uses lazy loading - only fetches when fetchStreamingData is called
 */
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

  // Determine the country code based on the current language
  let country = 'us';
  try {
    const currentLang = i18n?.language;
    country = currentLang === 'pl' ? 'pl' : 'us';
  } catch (e) {
    console.warn('Error accessing i18n language, defaulting to "us"');
  }

  const fetchStreamingData = useCallback(async () => {
    // Validate inputs
    if (!tmdbId || tmdbId <= 0) {
      console.log('[hook] Invalid tmdbId:', tmdbId);
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

    // Prevent concurrent requests
    if (state.isLoading) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, requested: true, error: null }));
    
    console.log(`[hook] Fetching streaming availability for TMDB ID: ${tmdbId}, title: ${title}, year: ${year}, country: ${country}`);
    
    try {
      const services = await getStreamingAvailability(tmdbId, title, year, country);
      
      console.log(`[hook] Received ${services.length} streaming services`);
      
      // Extract links from services
      const links: Record<string, string> = {};
      services.forEach(service => {
        if (service.link) {
          links[service.service] = service.link;
        }
      });
      
      const newState = {
        services,
        isLoading: false,
        error: null,
        timestamp: Date.now(),
        source: services.length > 0 ? services[0].source || 'api' : 'none',
        requested: true,
        links
      };
      
      setState(newState);
      console.log(`[hook] Final result: Found ${services.length} streaming services from source: ${services.length > 0 ? services[0].source || 'api' : 'none'}`);
      
      // Log detailed service information for debugging
      if (services.length > 0) {
        console.log('[hook] Service details:', services.map(s => ({
          name: s.service,
          link: s.link,
          source: s.source
        })));
      }
    } catch (error: any) {
      console.error('[hook] Error fetching streaming availability:', error.message);
      
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
  }, [tmdbId, title, year, country]);

  const refetch = useCallback(() => {
    setState(prev => ({
      ...prev,
      requested: false,
      error: null
    }));
    fetchStreamingData();
  }, [fetchStreamingData]);

  return {
    ...state,
    fetchStreamingData,
    refetch
  };
}
