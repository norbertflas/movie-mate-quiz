
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
        
        // Try Watchmode API first (most reliable)
        let services: StreamingPlatformData[] = [];
        try {
          console.log("Attempting to fetch from Watchmode API...");
          services = await getWatchmodeStreamingAvailability(movieId);
          console.log(`Watchmode returned ${services.length} streaming services`);
        } catch (watchmodeError) {
          console.error("Error fetching from Watchmode:", watchmodeError);
        }
        
        // If Watchmode fails or returns no results, try our custom service
        if (services.length === 0) {
          console.log("Falling back to custom streaming availability service...");
          services = await getStreamingAvailability(movieId);
          console.log(`Custom service returned ${services.length} streaming services`);
        }

        // Ensure all services have proper links
        const formattedServices = formatServiceLinks(services);
        
        return {
          services: formattedServices,
          timestamp: new Date().toISOString(),
          isStale: false
        };
      } catch (error) {
        console.error("Error in streaming availability hook:", error);
        return {
          services: [],
          timestamp: new Date().toISOString(),
          isStale: true
        };
      }
    },
    retry: 1,
    staleTime: CACHE_EXPIRY,
    gcTime: CACHE_EXPIRY * 24, // Keep in cache for 24 hours
  });
};
