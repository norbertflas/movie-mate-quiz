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
      console.warn(`Cache expired for movie ID: ${movieId}`);
      localStorage.removeItem(`${CACHE_PREFIX}${movieId}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cache for movie ID:', movieId, error.message || error);
    return null;
  }
};

// Function to merge streaming results with deduplication and error handling
const mergeStreamingResults = (results: StreamingPlatformData[][]): StreamingPlatformData[] => {
  const serviceMap = new Map<string, StreamingPlatformData>();
  
  results.forEach(sources => {
    if (!sources || !Array.isArray(sources)) return;
    
    sources.forEach(source => {
      if (!source || !source.service) return;
      
      const lowerCaseName = source.service.toLowerCase();
      if (!serviceMap.has(lowerCaseName)) {
        serviceMap.set(lowerCaseName, {
          ...source,
          link: source.link || `https://${lowerCaseName.replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch`
        });
      } else {
        const existingService = serviceMap.get(lowerCaseName);
        if (!existingService.logo && source.logo) {
          serviceMap.set(lowerCaseName, {
            ...source,
            link: source.link || `https://${lowerCaseName.replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch`
          });
        }
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
            console.error('Error fetching data from JustWatch API:', err.message || err);
            return [];
          })
        );
        
        // 2. If tmdbId is available, try Watchmode API via tmdbId
        if (tmdbId) {
          availableServicesPromises.push(
            getWatchmodeStreamingAvailability(tmdbId).catch(err => {
              console.error('Error fetching Watchmode data using TMDB ID:', err.message || err);
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
              console.error('Error during Watchmode title search:', err.message || err);
              return [];
            }
          };
          availableServicesPromises.push(watchmodeTitlePromise());
        }
        
        // 4. Try our own streaming availability service as a fallback
        if (tmdbId) {
          availableServicesPromises.push(
            getStreamingAvailability(tmdbId, title, year).catch(err => {
              console.error('Error fetching data from custom streaming API:', err.message || err);
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
        
        console.log('Streaming results fetched from APIs:', availableServices);
        if (!Array.isArray(availableServices)) {
          console.error('Unexpected structure in streaming results:', availableServices);
          throw new Error('Invalid streaming results structure');
        }
        
        // Merge results from different sources
        const mergedServices = mergeStreamingResults(availableServices);
        if (mergedServices.length === 0) {
          console.warn('No streaming services found. Returning empty results.');
        }
        
        // Add some mock data if nothing was found (during development)
        if (mergedServices.length === 0 && process.env.NODE_ENV === 'development') {
          console.log('No streaming services found, adding mock data for development');
          mergedServices.push(
            {
              service: 'Netflix',
              available: true,
              link: 'https://netflix.com/watch',
              logo: '/streaming-icons/netflix.svg'
            },
            {
              service: 'Disney+',
              available: true,
              link: 'https://disneyplus.com/watch',
              logo: '/streaming-icons/disney.svg'
            }
          );
        }
        
        // Cache the results if we have a tmdbId
        if (tmdbId && mergedServices.length > 0) {
          cacheStreamingData(tmdbId, mergedServices);
        }

        return {
          services: mergedServices,
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
          isStale: true,
          error: error.message || 'Unknown error occurred while fetching streaming availability'
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