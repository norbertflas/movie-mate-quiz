
import { useQuery } from "@tanstack/react-query";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = 'streaming_';

// Global request queue management
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
const MAX_CONCURRENT_REQUESTS = 3;
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

const cacheStreamingData = (movieId: number, data: StreamingPlatformData[]) => {
  const cacheItem: StreamingAvailabilityCache = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(`${CACHE_PREFIX}${movieId}`, JSON.stringify(cacheItem));
};

const getCachedStreamingData = (movieId: number): StreamingPlatformData[] | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${movieId}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached) as StreamingAvailabilityCache;
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_PREFIX}${movieId}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const validateStreamingData = (services: StreamingPlatformData[]): StreamingPlatformData[] => {
  const now = new Date();
  return services.filter(service => {
    const endDate = service.endDate ? new Date(service.endDate) : null;
    const startDate = service.startDate ? new Date(service.startDate) : null;
    
    return (
      service.available !== false &&
      (!endDate || endDate > now) &&
      (!startDate || startDate <= now)
    );
  });
};

export const useStreamingAvailability = (tmdbId: number | undefined, title?: string, year?: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['streamingAvailability', tmdbId, title, year],
    queryFn: async () => {
      if (!tmdbId) {
        throw new Error('TMDB ID is required');
      }

      // Check cache first
      const cachedData = getCachedStreamingData(tmdbId);
      if (cachedData) {
        console.log('Using cached streaming data for movie:', tmdbId);
        return {
          services: validateStreamingData(cachedData),
          timestamp: new Date().toISOString(),
          isStale: false
        };
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
        const validatedServices = validateStreamingData(services);
        
        // Cache the validated results
        if (validatedServices.length > 0) {
          cacheStreamingData(tmdbId, validatedServices);
        }

        return {
          services: validatedServices,
          timestamp: new Date().toISOString(),
          isStale: false
        };
      } catch (error: any) {
        console.error('Streaming availability error:', error);
        
        // Parse error body if it's a string
        const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
        
        if (error?.status === 429) {
          const retryAfter = errorBody?.retryAfter || 60;
          
          toast({
            title: t("errors.rateLimitExceeded"),
            description: t("errors.tryAgainIn", { seconds: retryAfter }),
            variant: "destructive",
          });
          
          lastRequestTime = Date.now() + (retryAfter * 1000);
          
          return {
            services: [],
            timestamp: new Date().toISOString(),
            isStale: true
          };
        }
        
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
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
};
