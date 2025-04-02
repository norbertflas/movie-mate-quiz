
import { useState, useEffect } from "react";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import type { StreamingPlatformData } from "@/types/streaming";
import i18n from "@/i18n";

interface StreamingAvailabilityState {
  services: StreamingPlatformData[];
  isLoading: boolean;
  error: Error | null;
  timestamp: number;
  source: string;
}

export function useStreamingAvailability(tmdbId: number, title?: string, year?: string) {
  const [state, setState] = useState<StreamingAvailabilityState>({
    services: [],
    isLoading: true,
    error: null,
    timestamp: 0,
    source: 'none'
  });

  const currentLang = i18n.language;
  const country = currentLang === 'pl' ? 'pl' : 'us';

  useEffect(() => {
    if (!tmdbId || tmdbId <= 0) {
      console.log('[hook] Invalid tmdbId:', tmdbId);
      setState({
        services: [],
        isLoading: false,
        error: new Error('Invalid TMDB ID'),
        timestamp: Date.now(),
        source: 'none'
      });
      return;
    }

    console.log(`[hook] Fetching streaming availability for TMDB ID: ${tmdbId}, title: ${title}, year: ${year}, country: ${country}`);
    
    let isMounted = true;
    
    async function fetchData() {
      try {
        const services = await getStreamingAvailability(tmdbId, title, year, country);
        
        if (isMounted) {
          console.log(`[hook] Received ${services.length} streaming services`);
          if (services.length === 0) {
            console.log('[hook] Custom API returned no services');
          }
          
          setState({
            services,
            isLoading: false,
            error: null,
            timestamp: Date.now(),
            source: services.length > 0 ? services[0].source || 'api' : 'none'
          });
          console.log(`[hook] Final result: Found ${services.length} streaming services from source: ${services.length > 0 ? services[0].source || 'api' : 'none'}`);
        }
      } catch (error) {
        console.error('[hook] Error fetching streaming availability:', error);
        if (isMounted) {
          setState({
            services: [],
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error)),
            timestamp: Date.now(),
            source: 'error'
          });
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [tmdbId, title, year, country]);

  return state;
}
