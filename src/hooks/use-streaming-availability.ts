
import { useQuery } from "@tanstack/react-query";
import type { StreamingPlatformData } from "@/types/streaming";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { getWatchmodeStreamingAvailability } from "@/services/watchmode";
import { formatServiceLinks } from "@/utils/streamingServices";

// Cache expiry in milliseconds - 1 hour
const CACHE_EXPIRY = 60 * 60 * 1000;

/**
 * Hook to fetch streaming availability data for a movie
 */
export const useStreamingAvailability = (movieId: number) => {
  return useQuery({
    queryKey: ["streamingAvailability", movieId],
    queryFn: async () => {
      try {
        console.log(`Fetching streaming availability for movie ID: ${movieId}`);
        
        if (!movieId) {
          return { services: [], timestamp: new Date().toISOString(), isStale: false };
        }
        
        // Try Watchmode API first as it's more reliable
        let services: StreamingPlatformData[] = [];
        try {
          console.log("Fetching from Watchmode API...");
          services = await getWatchmodeStreamingAvailability(movieId);
          console.log(`Watchmode API returned ${services.length} streaming services`);
        } catch (watchmodeError) {
          console.error("Error fetching from Watchmode API:", watchmodeError);
          // Don't throw here, try the next service
        }
        
        // If Watchmode doesn't return results, try Streaming Availability API as backup
        if (!services || services.length === 0) {
          console.log("Falling back to custom streaming availability service...");
          try {
            services = await getStreamingAvailability(movieId);
            console.log(`Custom service returned ${services.length} streaming services`);
          } catch (streamingError) {
            console.error("Error fetching from custom streaming service:", streamingError);
            // Return empty results instead of throwing
          }
        }

        // Ensure all services have proper links and remove any undefined services
        const validServices = services.filter(service => !!service && !!service.service);
        const formattedServices = formatServiceLinks(validServices);
        
        console.log("Final streaming services:", formattedServices.map(s => s.service).join(', '));
        
        return {
          services: formattedServices,
          timestamp: new Date().toISOString(),
          isStale: false
        };
      } catch (error) {
        console.error("Error in streaming availability hook:", error);
        // Return empty results instead of throwing to prevent UI issues
        return {
          services: [],
          timestamp: new Date().toISOString(),
          isStale: true
        };
      }
    },
    retry: 2,
    staleTime: CACHE_EXPIRY,
    gcTime: CACHE_EXPIRY * 24, // Keep in cache for 24 hours
    // Add better error handling
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error("Streaming availability query settled with error:", error);
        }
      }
    }
  });
};
