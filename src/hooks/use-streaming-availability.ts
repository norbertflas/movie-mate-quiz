
import { useQuery } from "@tanstack/react-query";
import type { StreamingPlatformData } from "@/types/streaming";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { getWatchmodeStreamingAvailability } from "@/services/watchmode";
import { formatServiceLinks } from "@/utils/streamingServices";
import { getTsStreamingAvailability } from "@/services/tsStreamingAvailability";

// Cache expiry in milliseconds - 1 hour
const CACHE_EXPIRY = 60 * 60 * 1000;

interface StreamingAvailabilityResult {
  services: StreamingPlatformData[];
  timestamp: string;
  isStale: boolean;
  source?: string;
}

/**
 * Hook to fetch streaming availability data for a movie
 */
export const useStreamingAvailability = (movieId: number) => {
  return useQuery<StreamingAvailabilityResult, Error>({
    queryKey: ["streamingAvailability", movieId],
    queryFn: async () => {
      try {
        console.log(`[hook] Fetching streaming availability for movie ID: ${movieId}`);
        
        if (!movieId) {
          console.log('[hook] Invalid movieId, returning empty result');
          return { services: [], timestamp: new Date().toISOString(), isStale: false };
        }
        
        // First try the new ts-streaming-availability implementation
        let services: StreamingPlatformData[] = [];
        let source = "";
        let skipLogging = false;
        
        try {
          console.log("[hook] 1. Fetching from ts-streaming-availability API...");
          services = await getTsStreamingAvailability(movieId);
          
          if (services && services.length > 0) {
            console.log('[hook] Successfully got streaming data from ts-streaming-availability API:', 
              services.map(s => s.service).join(', '));
            source = "ts-streaming";
          } else {
            console.log('[hook] ts-streaming-availability returned no services');
          }
        } catch (tsStreamingError: any) {
          // Specific handling for the 502 error from the ts-streaming API
          if (tsStreamingError.message === 'streaming_server_error_502') {
            console.log('[hook] Detected 502 error from ts-streaming API, silently falling back to alternatives');
            skipLogging = true; // Skip duplicate error logging
          } else {
            console.error("[hook] Error fetching from ts-streaming-availability API:", tsStreamingError);
          }
        }
        
        // If ts-streaming API doesn't return results, try Watchmode API as a backup
        if (!services || services.length === 0) {
          try {
            console.log("[hook] 2. Falling back to Watchmode API...");
            services = await getWatchmodeStreamingAvailability(movieId);
            
            if (services && services.length > 0) {
              console.log('[hook] Successfully got streaming data from Watchmode API:', 
                services.map(s => s.service).join(', '));
              source = "watchmode";
            } else {
              console.log('[hook] Watchmode API returned no services');
            }
          } catch (watchmodeError: any) {
            if (!skipLogging) {
              console.error("[hook] Error fetching from Watchmode API:", watchmodeError);
            }
          }
        }
        
        // If both ts-streaming and Watchmode don't have results, try original custom service as last resort
        if (!services || services.length === 0) {
          try {
            console.log("[hook] 3. Falling back to custom streaming availability service...");
            services = await getStreamingAvailability(movieId);
            
            if (services && services.length > 0) {
              console.log('[hook] Successfully got streaming data from custom API:', 
                services.map(s => s.service).join(', '));
              source = "custom";
            } else {
              console.log('[hook] Custom API returned no services');
            }
          } catch (streamingError: any) {
            if (!skipLogging) {
              console.error("[hook] Error fetching from custom streaming service:", streamingError);
            }
          }
        }

        // Ensure all services have proper links and remove any undefined/invalid services
        const validServices = (services || []).filter(service => !!service && !!service.service);
        
        // Format all service links to make sure they're usable
        const formattedServices = formatServiceLinks(validServices);
        
        console.log(`[hook] Final result: Found ${formattedServices.length} streaming services from source: ${source || 'none'}`);
        
        // Add debugging info to each service
        const enhancedServices = formattedServices.map(service => ({
          ...service,
          // Add metadata indicating data source
          source: source || 'unknown'
        }));
        
        return {
          services: enhancedServices,
          timestamp: new Date().toISOString(),
          isStale: false,
          source: source
        };
      } catch (error) {
        console.error("[hook] Unhandled error in streaming availability hook:", error);
        // Return empty results instead of throwing to prevent UI issues
        return {
          services: [],
          timestamp: new Date().toISOString(),
          isStale: true,
          source: "error"
        };
      }
    },
    // Retry up to 2 times in case of API failures
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: CACHE_EXPIRY,
    gcTime: CACHE_EXPIRY * 24, // Keep in cache for 24 hours
    enabled: movieId > 0,
  });
};
