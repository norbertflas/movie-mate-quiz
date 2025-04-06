
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
}

// Check if localStorage is available to avoid errors
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

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

  // Determine the country code based on the current language
  // Use a try-catch block to avoid potential issues with i18n
  let country = 'us';
  try {
    const currentLang = i18n?.language;
    country = currentLang === 'pl' ? 'pl' : 'us';
  } catch (e) {
    console.warn('Error accessing i18n language, defaulting to "us"');
  }

  const fetchStreamingData = useCallback(async () => {
    // If we're already in a loading state or invalid TMDB ID, don't proceed
    if (state.isLoading || !tmdbId || tmdbId <= 0) {
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
      }
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, requested: true }));
    
    console.log(`[hook] Fetching streaming availability for TMDB ID: ${tmdbId}, title: ${title}, year: ${year}, country: ${country}`);
    
    try {
      // We'll simplify the approach and rely primarily on our fallback service
      // since the external APIs are giving errors
      const services = await getStreamingAvailability(tmdbId, title, year, country);
      
      console.log(`[hook] Received ${services.length} streaming services from fallback`);
      
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
    } catch (error: any) {
      console.error('[hook] Error fetching streaming availability:', error.message);
      
      setState({
        services: [],
        isLoading: false,
        error: new Error(error.message || 'Failed to fetch streaming availability'),
        timestamp: Date.now(),
        source: 'error',
        requested: true
      });
    }
  }, [tmdbId, title, year, country, state.isLoading]);

  const refetch = useCallback(() => {
    setState(prev => ({
      ...prev,
      requested: false,
    }));
    fetchStreamingData();
  }, [fetchStreamingData]);

  return {
    ...state,
    fetchStreamingData,
    refetch
  };
}
