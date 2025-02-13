
import { useQuery } from "@tanstack/react-query";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

// Global request queue management
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getNextRequestDelay = () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL || activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return Math.max(MIN_REQUEST_INTERVAL - timeSinceLastRequest, 0);
  }
  
  return 0;
};

export type StreamingService = {
  service: string;
  link: string;
  logo?: string;
};

export type StreamingAvailabilityData = {
  services: StreamingService[];
  timestamp: string;
  isStale: boolean;
};

export const useStreamingAvailability = (tmdbId: number | undefined, title?: string, year?: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  return useQuery<StreamingAvailabilityData, Error>({
    queryKey: ['streamingAvailability', tmdbId, title, year],
    queryFn: async () => {
      if (!tmdbId) {
        throw new Error('TMDB ID is required');
      }

      // Check if we need to wait before making the request
      const delay = getNextRequestDelay();
      if (delay > 0) {
        await wait(delay);
      }
      
      activeRequests++;
      lastRequestTime = Date.now();
      
      try {
        const services = await getStreamingAvailability(tmdbId, title, year);
        return {
          services,
          timestamp: new Date().toISOString(),
          isStale: false
        };
      } catch (error: any) {
        console.error('Streaming availability error:', error);
        
        if (error?.status === 429) {
          const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
          const retryAfter = errorBody?.retryAfter || 60;
          
          toast({
            title: t("errors.rateLimitExceeded"),
            description: t("errors.tryAgainIn", { seconds: retryAfter }),
            variant: "destructive",
          });
          
          lastRequestTime = Date.now() + (retryAfter * 1000);
          throw error;
        }
        
        // For other errors, return empty services array
        return {
          services: [],
          timestamp: new Date().toISOString(),
          isStale: true
        };
      } finally {
        activeRequests--;
      }
    },
    enabled: !!tmdbId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 120, // Keep unused data for 2 hours
    retry: (failureCount, error: any) => {
      // Only retry rate limit errors a few times
      if (error?.status === 429) {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (_, error: any) => {
      if (error?.status === 429) {
        const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
        return (errorBody?.retryAfter || 60) * 1000;
      }
      return 0;
    }
  });
};
