import { getStreamingServices } from "@/services/preferences";
import type { StreamingPlatformData, StreamingService } from "@/types/streaming";

// movie_streaming_availability is a legacy table removed in Supabase migration.
export const getStreamingAvailabilityFromDB = async (_tmdbId: number, _type: 'movie' | 'tv', _countryCode: string = 'US'): Promise<StreamingPlatformData[]> => {
  // legacy table removed in Supabase migration
  return [];
};

// movie_streaming_availability is a legacy table removed in Supabase migration.
export const updateStreamingLink = async (_id: number, _link: string): Promise<boolean> => {
  // legacy table removed in Supabase migration
  return true;
};

// Map of known direct links for specific movies
export const knownMovieLinks: Record<string, Record<string, string>> = {
  // Alien (1979) - TMDB ID: 348
  "348": {
    "hulu": "https://www.hulu.com/movie/alien-27389b6b-bf27-45a6-afdf-cef0fe723cff",
    "disney+": "https://www.disneyplus.com/movies/alien/4IcBqr9hAPDJ",
    "amazon prime": "https://www.amazon.com/Alien-Sigourney-Weaver/dp/B001GJ7OT8",
    "apple tv+": "https://tv.apple.com/us/movie/alien/umc.cmc.53br8g12tjkru519sz48vkjqa",
  }
};

// Function to build service URL based on service name and movie details
export const buildServiceUrl = (service: StreamingPlatformData, tmdbId?: number, title?: string) => {
  if (!service) return null;

  // Special cases for direct links (when available from the API)
  if (service.link) {
    return service.link;
  }
  
  // Handle specific services based on service name
  switch(service.service) {
    case 'Netflix':
      return 'https://www.netflix.com/search?q=' + (title || '');
    case 'Disney Plus':
    case 'DisneyPlus':
    case 'Disney+':
      return 'https://www.disneyplus.com/search?q=' + (title || '');
    case 'Hulu':
      // Special case for Alien (1979)
      if (title?.toLowerCase() === "alien" || tmdbId === 348) {
        return 'https://www.hulu.com/movie/alien-27389b6b-bf27-45a6-afdf-cef0fe723cff';
      }
      return 'https://www.hulu.com/search?q=' + (title || '');
    case 'Amazon Prime Video':
    case 'Amazon Prime':
    case 'Amazon':
      return 'https://www.amazon.com/s?k=' + (title || '') + '&i=instant-video';
    case 'HBO Max':
    case 'Max':
      return 'https://play.max.com/search?q=' + (title || '');
    case 'Apple TV Plus':
    case 'Apple TV+':
    case 'AppleTV+':
      return 'https://tv.apple.com/search?term=' + (title || '');
    default:
      return service.link || null;
  }
};

// Function to normalize service names for consistent display
export const normalizeServiceName = (providerName: string): string => {
  const normalizedName = providerName.toLowerCase().trim();
  
  if (normalizedName.includes('netflix')) return 'Netflix';
  if (normalizedName.includes('disney')) return 'Disney+';
  if (normalizedName.includes('hulu')) return 'Hulu';
  if (normalizedName.includes('amazon') || normalizedName.includes('prime')) return 'Amazon Prime';
  if (normalizedName.includes('hbo')) return 'HBO Max';
  if (normalizedName.includes('max') && !normalizedName.includes('hbo')) return 'Max';
  if (normalizedName.includes('apple')) return 'Apple TV+';
  
  return providerName; // Return original if no match
};

// Function to get friendly service name for display
export const getFriendlyServiceName = (providerName: string): string => {
  switch (providerName) {
    case 'Netflix':
      return 'Netflix';
    case 'Disney Plus':
    case 'DisneyPlus':
    case 'Disney+':
      return 'Disney+';
    case 'Hulu':
      return 'Hulu';
    case 'Amazon Prime Video':
    case 'Amazon Prime':
    case 'Amazon':
      return 'Amazon Prime Video';
    case 'HBO Max':
      return 'HBO Max';
    case 'Max':
      return 'Max';
    case 'Apple TV Plus':
    case 'Apple TV+':
    case 'AppleTV+':
      return 'Apple TV+';
    default:
      return providerName;
  }
};

// CRITICAL FIX: Update language to region mapping to include Poland
export const languageToRegion: Record<string, string> = {
  'en': 'us',
  'en-US': 'us',
  'en-GB': 'us',
  'pl': 'pl', // CRITICAL: Polish language now maps to Polish region
  'es': 'us',
  'fr': 'us',
  'de': 'us',
  'it': 'us'
};

// Function to get streaming services by region - now supports multiple regions
export const getStreamingServicesByRegion = async (region: string): Promise<StreamingService[]> => {
  try {
    console.log(`[getStreamingServicesByRegion] Fetching for region: ${region.toUpperCase()}`);

    // The Worker catalog endpoint is region-agnostic; return the full catalog.
    return await getStreamingServices();
  } catch (error) {
    console.error("Error in getStreamingServicesByRegion:", error);
    return [];
  }
};

// Function to get service icon path
export const getServiceIconPath = (serviceName: string): string => {
  const name = serviceName.toLowerCase().replace(/[\s+]/g, '');
  
  if (name.includes('netflix')) return '/streaming-icons/netflix.svg';
  if (name.includes('disney')) return '/streaming-icons/disney.svg';
  if (name.includes('hulu')) return '/streaming-icons/hulu.svg';
  if (name.includes('amazon') || name.includes('prime')) return '/streaming-icons/prime.svg';
  if (name.includes('hbomax')) return '/streaming-icons/hbomax.svg';
  if (name === 'max') return '/streaming-icons/max.svg';
  if (name.includes('apple')) return '/streaming-icons/apple.svg';
  if (name.includes('paramount')) return '/streaming-icons/paramount.svg';
  
  return '/streaming-icons/default.svg';
};

// Format service data to ensure it has links and logos
export const formatServiceLinks = (services: Array<any>): StreamingPlatformData[] => {
  if (!services || !Array.isArray(services)) return [];
  
  return services.map(service => {
    const serviceName = typeof service === 'string' 
      ? service 
      : service.service || service.provider || service.name || '';
    
    const normalizedService = normalizeServiceName(serviceName);
    
    const serviceObj: StreamingPlatformData = {
      service: normalizedService,
      available: true,
      link: service.link || buildServiceUrl({ service: normalizedService, available: true }),
      logo: service.logo || getServiceIconPath(normalizedService),
      type: service.type || 'subscription'
    };
    
    if (service.tmdbId) serviceObj.tmdbId = service.tmdbId;
    if (service.title) serviceObj.title = service.title;
    if (service.startDate) serviceObj.startDate = service.startDate;
    if (service.endDate) serviceObj.endDate = service.endDate;
    
    return serviceObj;
  });
};

// Function to get display text for streaming type
export const getStreamingTypeDisplay = (type: string): string => {
  switch (type) {
    case 'subscription':
      return 'Subscription';
    case 'rent':
      return 'Rent';
    case 'buy':
      return 'Buy';
    case 'addon':
      return 'Add-on';
    case 'free':
      return 'Free';
    default:
      return type;
  }
};
