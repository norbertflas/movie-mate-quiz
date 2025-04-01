import { useQuery } from "@tanstack/react-query";
import type { StreamingPlatformData } from "@/types/streaming";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { getWatchmodeStreamingAvailability } from "@/services/watchmode";
import { formatServiceLinks } from "@/utils/streamingServices";
import { getTsStreamingAvailability } from "@/services/tsStreamingAvailability";

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
        
        // First try the new ts-streaming-availability implementation
        let services: StreamingPlatformData[] = [];
        try {
          console.log("Fetching from ts-streaming-availability API...");
          services = await getTsStreamingAvailability(movieId);
          console.log(`ts-streaming-availability API returned ${services.length} streaming services`);
        } catch (tsStreamingError) {
          console.error("Error fetching from ts-streaming-availability API:", tsStreamingError);
          // Don't throw here, just try the next service
        }
        
        // If ts-streaming-availability API doesn't return results, try the original Streaming Availability API
        if (!services || services.length === 0) {
          try {
            console.log("Fallback to original Streaming Availability API...");
            services = await getStreamingAvailability(movieId);
            console.log(`Original Streaming Availability API returned ${services.length} streaming services`);
          } catch (streamingAvailabilityError) {
            console.error("Error fetching from Streaming Availability API:", streamingAvailabilityError);
            // Don't throw here, just try the next service
          }
        }
        
        // If neither of the above methods worked, try Watchmode as a last resort
        if (!services || services.length === 0) {
          console.log("Falling back to Watchmode API...");
          try {
            services = await getWatchmodeStreamingAvailability(movieId);
            console.log(`Watchmode returned ${services.length} streaming services`);
          } catch (watchmodeError) {
            console.error("Error fetching from Watchmode:", watchmodeError);
            // Don't throw here either, just return empty results
          }
        }

        // Ensure all services have proper links and remove any undefined services
        const validServices = services.filter(service => !!service);
        const formattedServices = formatServiceLinks(validServices);
        
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
    retry: 1,
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
