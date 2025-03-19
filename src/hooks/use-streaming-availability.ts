
import { useQuery } from "@tanstack/react-query";
import { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";
import { formatServiceLinks } from "@/utils/streamingServices";

// Cache for streaming availability data
const availabilityCache: Record<string, StreamingAvailabilityCache> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Service mapping for consistent naming
const serviceMap: Record<string, string> = {
  netflix: "Netflix",
  prime: "Amazon Prime",
  disney: "Disney+",
  hbo: "HBO Max",
  hulu: "Hulu",
  peacock: "Peacock",
  paramount: "Paramount+",
  apple: "Apple TV+",
  mubi: "MUBI",
  stan: "Stan",
  now: "NOW",
  crave: "Crave",
  iplayer: "BBC iPlayer",
  all4: "All 4",
  britbox: "BritBox",
  hotstar: "Hotstar",
  zee5: "ZEE5",
  curiosity: "Curiosity Stream",
  crunchyroll: "Crunchyroll",
  showtime: "Showtime",
  starz: "Starz",
  max: "Max",
};

// Create a deep copy of an object
const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Format streaming service name
const formatServiceName = (service: string): string => {
  const formattedName = serviceMap[service.toLowerCase()] || service;
  return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
};

// Fetch streaming availability from the API
const fetchStreamingAvailability = async (
  movieId: number
): Promise<StreamingPlatformData[]> => {
  try {
    // First, try to fetch from Watchmode API
    const response = await fetch(
      `/api/watchmode-title-details?tmdb_id=${movieId}`
    );
    const data = await response.json();

    if (response.ok && data.sources && data.sources.length > 0) {
      return formatWatchmodeData(data.sources);
    }

    // If Watchmode fails, try custom streaming availability endpoint
    const backupResponse = await fetch(
      `/api/streaming-availability?movie_id=${movieId}`
    );
    
    if (!backupResponse.ok) {
      throw new Error("Failed to fetch streaming data");
    }
    
    const backupData = await backupResponse.json();
    
    if (backupData && backupData.results) {
      return formatCustomApiData(backupData.results);
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching streaming availability:", error);
    return [];
  }
};

// Format data from Watchmode API
const formatWatchmodeData = (
  sources: any[]
): StreamingPlatformData[] => {
  const uniqueServices = new Map<string, StreamingPlatformData>();

  sources.forEach((source) => {
    if (!source || typeof source !== 'object') return;
    
    const serviceName = source.name || "";
    const formattedName = formatServiceName(serviceName);
    
    // Create a new object with all required properties
    const serviceData: StreamingPlatformData = {
      service: formattedName,
      available: true,
      link: source.web_url || "",
      logo: getServiceLogo(serviceName.toLowerCase()),
      type: source.type || "subscription",
      sourceConfidence: 0.9
    };
    
    // Use Map to handle duplicates - prefer subscription over rental
    if (!uniqueServices.has(formattedName) || 
        (uniqueServices.get(formattedName)?.type !== "subscription" && 
         serviceData.type === "subscription")) {
      uniqueServices.set(formattedName, serviceData);
    }
  });

  return Array.from(uniqueServices.values());
};

// Format data from custom API
const formatCustomApiData = (
  results: any
): StreamingPlatformData[] => {
  const services: StreamingPlatformData[] = [];

  if (!results || typeof results !== 'object') {
    return services;
  }

  // Process different streaming platforms from the results
  Object.entries(results).forEach(([key, value]) => {
    if (!value || typeof value !== 'object') return;
    
    // Skip non-service objects
    if (key === "meta" || key === "id" || key === "tmdbId") {
      return;
    }

    const countryData = value as Record<string, any>;
    
    // Process each country's data
    Object.entries(countryData).forEach(([country, countryServices]) => {
      if (!countryServices || typeof countryServices !== 'object') return;
      
      // Process each service in the country
      Object.entries(countryServices as Record<string, any>).forEach(([service, serviceData]) => {
        if (!serviceData || typeof serviceData !== 'object') return;
        
        const formattedName = formatServiceName(service);
        const link = (serviceData as any).link || "";
        
        services.push({
          service: formattedName,
          available: true,
          link: link,
          logo: getServiceLogo(service.toLowerCase()),
          type: "subscription",
          sourceConfidence: 0.7
        });
      });
    });
  });

  return services;
};

// Get logo URL for a streaming service
const getServiceLogo = (service: string): string => {
  const knownServices = [
    "netflix", "prime", "disney", "hbo", "hulu", 
    "max", "apple", "paramount", "amazon", "disneyplus"
  ];
  
  const normalizedService = service.toLowerCase().replace(/\s+/g, "");
  
  // Check if we have a specific logo for this service
  if (knownServices.includes(normalizedService)) {
    return `/streaming-icons/${normalizedService}.svg`;
  }
  
  return "/streaming-icons/default.svg";
};

// Merge results from different sources
const mergeStreamingResults = (
  sources: Array<StreamingPlatformData[]>
): StreamingPlatformData[] => {
  const mergedServices = new Map<string, StreamingPlatformData>();
  
  sources.forEach((sourceArray) => {
    if (!Array.isArray(sourceArray)) return;
    
    sourceArray.forEach((source) => {
      if (!source || typeof source !== 'object') return;
      
      const serviceName = source.service;
      
      if (!serviceName) return;
      
      // If service already exists, use the one with higher confidence or more complete data
      if (mergedServices.has(serviceName)) {
        const existing = mergedServices.get(serviceName);
        
        if (existing && 
            ((source.sourceConfidence || 0) > (existing.sourceConfidence || 0) || 
             (!existing.link && source.link))) {
          
          // Create a new object with all required properties
          const updatedService: StreamingPlatformData = {
            service: serviceName,
            available: source.available !== undefined ? source.available : existing.available,
            link: source.link || existing.link || "",
            logo: source.logo || existing.logo || getServiceLogo(serviceName.toLowerCase()),
            type: source.type || existing.type || "subscription",
            sourceConfidence: source.sourceConfidence || existing.sourceConfidence || 0
          };
          
          mergedServices.set(serviceName, updatedService);
        }
      } else {
        // Create a new entry with all required properties
        const newService: StreamingPlatformData = {
          service: serviceName,
          available: source.available !== undefined ? source.available : true,
          link: source.link || "",
          logo: source.logo || getServiceLogo(serviceName.toLowerCase()),
          type: source.type || "subscription",
          sourceConfidence: source.sourceConfidence || 0
        };
        
        mergedServices.set(serviceName, newService);
      }
    });
  });
  
  // Convert map to array and format links
  const result = Array.from(mergedServices.values());
  return formatServiceLinks(result);
};

// Custom hook for fetching streaming availability
export const useStreamingAvailability = (movieId: number) => {
  return useQuery({
    queryKey: ["streamingAvailability", movieId],
    queryFn: async () => {
      // Check cache first
      const cachedData = availabilityCache[movieId];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
        return {
          services: cachedData.data,
          timestamp: new Date().toISOString(),
          isStale: false
        };
      }
      
      try {
        // If not in cache or expired, fetch new data
        const streamingData = await fetchStreamingAvailability(movieId);
        
        // Fetch backup data from another endpoint for merging
        let backupData: StreamingPlatformData[] = [];
        try {
          const geminiResponse = await fetch(
            `/api/streaming-availability-gemini?movie_id=${movieId}`
          );
          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            if (geminiData && geminiData.results) {
              backupData = formatCustomApiData(geminiData.results);
            }
          }
        } catch (error) {
          console.warn("Failed to fetch backup streaming data:", error);
        }
        
        // Merge results from different sources
        const mergedData = mergeStreamingResults([streamingData, backupData]);
        
        // Update cache
        availabilityCache[movieId] = {
          data: mergedData,
          timestamp: now
        };
        
        return {
          services: mergedData,
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
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
