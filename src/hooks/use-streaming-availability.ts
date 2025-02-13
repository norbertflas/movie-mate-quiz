
import { useQuery } from "@tanstack/react-query";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

// Global request queue management
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getNextRequestDelay = () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    return MIN_REQUEST_INTERVAL - timeSinceLastRequest;
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
      // Check if we need to wait before making the request
      const delay = getNextRequestDelay();
      if (delay > 0) {
        await wait(delay);
      }
      
      lastRequestTime = Date.now();
      
      try {
        const services = await getStreamingAvailability(tmdbId!, title, year);
        return {
          services,
          timestamp: new Date().toISOString(),
          isStale: false
        };
      } catch (error: any) {
        if (error?.status === 429) {
          const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
          const retryAfter = errorBody?.retryAfter || 60;
          
          toast({
            title: t("errors.rateLimitExceeded"),
            description: t("errors.tryAgainIn", { seconds: retryAfter }),
            variant: "destructive",
          });
          
          lastRequestTime = Date.now() + (retryAfter * 1000);
        }
        throw error;
      }
    },
    enabled: !!tmdbId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 120, // Keep unused data for 2 hours
    retry: (failureCount, error: any) => {
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
