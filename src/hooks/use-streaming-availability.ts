
import { useQuery } from "@tanstack/react-query";
import { getStreamingProviders } from "@/services/justwatch";
import { getWatchmodeStreamingAvailability } from "@/services/watchmode";
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

// Function to merge streaming results with deduplication
const mergeStreamingResults = (results: StreamingPlatformData[][]): StreamingPlatformData[] => {
  const serviceMap = new Map<string, StreamingPlatformData>();
  
  results.forEach(sources => {
    sources.forEach(source => {
      const lowerCaseName = source.service.toLowerCase();
      // Only add if not already exists, or if the current one has a logo and the existing one doesn't
      if (!serviceMap.has(lowerCaseName) || (!serviceMap.get(lowerCaseName)?.logo && source.logo)) {
        serviceMap.set(lowerCaseName, source);
      }
    });
  });
  
  return Array.from(serviceMap.values());
};

export const useStreamingAvailability = (tmdbId: number | undefined, title?: string, year?: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['streamingAvailability', tmdbId, title, year],
    queryFn: async () => {
      if (!title) {
        throw new Error('Title is required');
      }

      // Check cache first
      if (tmdbId) {
        const cachedData = getCachedStreamingData(tmdbId);
        if (cachedData) {
          console.log('Using cached streaming data for movie:', tmdbId);
          return {
            services: cachedData,
            timestamp: new Date().toISOString(),
            isStale: false
          };
        }
      }

      // Check if we need to wait before making the request
      const delay = getNextRequestDelay();
      if (delay > 0) {
        await wait(delay);
      }
      
      activeRequests++;
      lastRequestTime = Date.now();
      
      try {
        // Fetch from multiple sources in parallel
        const results = await Promise.allSettled([
          // JustWatch API
          getStreamingProviders(title, year),
          // Watchmode API (if tmdbId is available)
          ...(tmdbId ? [getWatchmodeStreamingAvailability(tmdbId)] : [])
        ]);
        
        // Process results, filtering out rejected promises
        const availableServices = results
          .filter((result): result is PromiseFulfilledResult<StreamingPlatformData[]> => 
            result.status === 'fulfilled'
          )
          .map(result => result.value);
        
        // Merge results from different sources
        const mergedServices = mergeStreamingResults(availableServices);
        
        // Ensure all services have a link property
        const servicesWithLinks = mergedServices.map(service => ({
          ...service,
          link: service.link || `https://${service.service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId || ''}`,
        }));
        
        // Cache the results if we have a tmdbId
        if (tmdbId && servicesWithLinks.length > 0) {
          cacheStreamingData(tmdbId, servicesWithLinks);
        }

        return {
          services: servicesWithLinks,
          timestamp: new Date().toISOString(),
          isStale: false
        };
      } catch (error: any) {
        console.error('Streaming availability error:', error);
        
        toast({
          title: t("errors.streamingAvailability"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
        
        return {
          services: [],
          timestamp: new Date().toISOString(),
          isStale: true
        };
      } finally {
        activeRequests--;
      }
    },
    enabled: !!title,
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
};
