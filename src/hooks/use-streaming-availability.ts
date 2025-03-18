
import { useQuery } from "@tanstack/react-query";
import { getStreamingProviders } from "@/services/justwatch";
import { getWatchmodeStreamingAvailability, searchWatchmodeTitle, getWatchmodeTitleDetails } from "@/services/watchmode";
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

// Function to properly format streaming service links
const formatServiceLink = (service: string, tmdbId?: number): string => {
  const serviceName = service.toLowerCase().trim();
  
  // Map of known streaming services to their domain format
  const serviceDomains: Record<string, string> = {
    'netflix': 'netflix.com/title',
    'disney+': 'disneyplus.com/movies',
    'disney plus': 'disneyplus.com/movies',
    'hulu': 'hulu.com/movie',
    'amazon prime': 'amazon.com/gp/video',
    'amazon prime video': 'amazon.com/gp/video',
    'prime video': 'amazon.com/gp/video',
    'max': 'max.com/movies',
    'hbomax': 'max.com/movies',
    'hbo max': 'max.com/movies',
    'paramount+': 'paramountplus.com/movies',
    'paramount plus': 'paramountplus.com/movies',
    'apple tv+': 'tv.apple.com',
    'apple tv': 'tv.apple.com',
    'appletv+': 'tv.apple.com',
    'peacock': 'peacocktv.com/watch'
  };
  
  // Find the matching domain or use a generic fallback
  const domain = Object.keys(serviceDomains).find(key => 
    serviceName.includes(key.toLowerCase())
  );
  
  const baseUrl = domain 
    ? `https://${serviceDomains[domain]}` 
    : `https://${serviceName.replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch`;
  
  return tmdbId ? `${baseUrl}/${tmdbId}` : baseUrl;
};

// Function to merge streaming results with deduplication and error handling
const mergeStreamingResults = (results: StreamingPlatformData[][]): StreamingPlatformData[] => {
  const serviceMap = new Map<string, StreamingPlatformData>();
  
  results.forEach(sources => {
    if (!sources || !Array.isArray(sources)) return;
    
    sources.forEach(source => {
      if (!source || !source.service) return;
      
      const lowerCaseName = source.service.toLowerCase();
      // Only add if not already exists, or if the current one has a logo and the existing one doesn't
      if (!serviceMap.has(lowerCaseName) || (!serviceMap.get(lowerCaseName)?.logo && source.logo)) {
        serviceMap.set(lowerCaseName, {
          ...source,
          // Ensure link is always present and properly formatted
          link: source.link || formatServiceLink(source.service, undefined)
        });
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

      // Check cache first if tmdbId is available
      if (tmdbId) {
        const cachedData = getCachedStreamingData(tmdbId);
        if (cachedData && cachedData.length > 0) {
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
        console.log('Fetching streaming availability for:', title, tmdbId);
        
        // Array to collect streaming data from different sources
        const availableServicesPromises = [];
        
        // 1. Try JustWatch API
        availableServicesPromises.push(
          getStreamingProviders(title, year).catch(err => {
            console.error('JustWatch API error:', err);
            return [];
          })
        );
        
        // 2. If tmdbId is available, try Watchmode API via tmdbId
        if (tmdbId) {
          availableServicesPromises.push(
            getWatchmodeStreamingAvailability(tmdbId).catch(err => {
              console.error('Watchmode API error (tmdbId):', err);
              return [];
            })
          );
        }
        // 3. If tmdbId is not available, try Watchmode API via title search
        else {
          const watchmodeTitlePromise = async () => {
            try {
              const titleResult = await searchWatchmodeTitle(title, year);
              if (titleResult) {
                return getWatchmodeTitleDetails(titleResult.id);
              }
              return [];
            } catch (err) {
              console.error('Watchmode title search error:', err);
              return [];
            }
          };
          availableServicesPromises.push(watchmodeTitlePromise());
        }
        
        // 4. Try our own streaming availability service as a fallback
        if (tmdbId) {
          availableServicesPromises.push(
            getStreamingAvailability(tmdbId, title, year).catch(err => {
              console.error('Custom streaming API error:', err);
              return [];
            })
          );
        }
        
        // Fetch from multiple sources in parallel
        const results = await Promise.allSettled(availableServicesPromises);
        
        // Process results, filtering out rejected promises
        const availableServices = results
          .filter((result): result is PromiseFulfilledResult<StreamingPlatformData[]> => 
            result.status === 'fulfilled' && Array.isArray(result.value)
          )
          .map(result => result.value);
        
        console.log('Streaming results:', availableServices);
        
        // Merge results from different sources
        const mergedServices = mergeStreamingResults(availableServices);
        
        // Format the links properly
        const formattedServices = mergedServices.map(service => ({
          ...service,
          link: formatServiceLink(service.service, tmdbId)
        }));
        
        // Cache the results if we have a tmdbId
        if (tmdbId && formattedServices.length > 0) {
          cacheStreamingData(tmdbId, formattedServices);
        }

        return {
          services: formattedServices,
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
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
};
