
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

  // Determine the country code based on the current language
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
        console.log('[hook] Attempting to fetch with TS API');
        const tsServices = await getTsStreamingAvailability(tmdbId, country, title, year);
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
        } else {
          console.log('[hook] TS API returned no services, trying next method');
        }
      } catch (tsError: any) {
        console.error('[hook] Error with TS API, trying fallback:', tsError.message);
        
        // Check for specific API rate limit errors
        if (tsError.message === 'streaming_rate_limit_exceeded') {
          setState({
            services: [],
            isLoading: false,
            error: new Error('API rate limit exceeded. Please try again later.'),
            timestamp: Date.now(),
            source: 'error',
            requested: true
          });
          return;
        }
      }
      
      // Try the DeepSeek AI API
      try {
        console.log('[hook] Attempting to fetch with DeepSeek AI');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        if (supabaseUrl && title) {
          const aiResponse = await fetch(`${supabaseUrl}/functions/v1/streaming-availability-deepseek`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tmdbId,
              title,
              year,
              country
            }),
          });
          
          if (aiResponse.ok) {
            const data = await aiResponse.json();
            if (data?.result && data.result.length > 0) {
              console.log(`[hook] DeepSeek API returned ${data.result.length} streaming services`);
              
              setState({
                services: data.result.map((service: any) => ({
                  ...service,
                  source: 'deepseek-ai'
                })),
                isLoading: false,
                error: null,
                timestamp: Date.now(),
                source: 'deepseek-ai',
                requested: true
              });
              return;
            } else {
              console.log('[hook] DeepSeek AI returned no services, trying next method');
            }
          }
        }
      } catch (aiError) {
        console.error('[hook] Error with DeepSeek AI, trying fallback:', aiError);
      }
      
      // Fall back to our refactored service
      console.log('[hook] Attempting to fetch with fallback service');
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
      
      // Add more descriptive errors for the user
      let errorMessage = 'Failed to fetch streaming availability';
      if (error.message === 'streaming_server_error_502') {
        errorMessage = 'The streaming availability service is currently experiencing issues. Please try again later.';
      } else if (error.message === 'streaming_rate_limit_exceeded') {
        errorMessage = 'API usage limit reached. Please try again later.';
      } else if (error.message === 'streaming_no_response') {
        errorMessage = 'No response from streaming service. Please check your connection and try again.';
      }
      
      setState({
        services: [],
        isLoading: false,
        error: new Error(errorMessage),
        timestamp: Date.now(),
        source: 'error',
        requested: true
      });
    }
  }, [tmdbId, title, year, country]);

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
