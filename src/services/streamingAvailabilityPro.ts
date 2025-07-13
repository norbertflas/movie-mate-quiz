
import { supabase } from "@/integrations/supabase/client";

export interface StreamingOption {
  service: string;
  serviceLogo: string;
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  quality: string;
  price?: {
    amount: number;
    currency: string;
    formatted: string;
  };
}

export interface MovieStreamingData {
  tmdbId: number;
  title: string;
  streamingOptions: StreamingOption[];
  availableServices: string[];
  hasStreaming: boolean;
  lastUpdated: string;
}

export interface StreamingBatchResponse {
  success: boolean;
  data: MovieStreamingData[];
  totalProcessed: number;
  totalFound: number;
  mode: 'instant' | 'lazy';
  country: string;
  timestamp: string;
}

// Cache management
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours for Pro plan
const CACHE_PREFIX = 'pro_streaming_cache';

const getCacheKey = (country: string, tmdbId: number): string => {
  return `${CACHE_PREFIX}_${country}_${tmdbId}`;
};

const getCachedData = (tmdbId: number, country: string): MovieStreamingData | null => {
  try {
    const cacheKey = getCacheKey(country, tmdbId);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const age = Date.now() - new Date(data.timestamp).getTime();
    
    if (age > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data.streamingData;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setCachedData = (tmdbId: number, country: string, data: MovieStreamingData): void => {
  try {
    const cacheKey = getCacheKey(country, tmdbId);
    const cacheEntry = {
      streamingData: data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

// Get user's country based on locale with better detection
export const getUserCountry = (): string => {
  // Check browser language settings
  const language = navigator.language.toLowerCase();
  const languages = navigator.languages?.map(lang => lang.toLowerCase()) || [];
  
  // Check for Polish
  if (language.includes('pl') || languages.some(lang => lang.includes('pl'))) {
    return 'pl';
  }
  
  // Check timezone as backup
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Warsaw') || timezone.includes('Europe/Warsaw')) {
    return 'pl';
  }
  
  console.log('🌍 Detected country: pl (default for this app)');
  return 'pl'; // Default to Poland for this app
};

// Get streaming data for multiple movies
export const getStreamingAvailabilityBatch = async (
  tmdbIds: number[],
  mode: 'instant' | 'lazy' = 'lazy',
  country?: string
): Promise<MovieStreamingData[]> => {
  const targetCountry = country || getUserCountry();
  
  // Check cache first
  const uncachedIds: number[] = [];
  const cachedResults: MovieStreamingData[] = [];

  tmdbIds.forEach(tmdbId => {
    const cached = getCachedData(tmdbId, targetCountry);
    if (cached) {
      cachedResults.push(cached);
    } else {
      uncachedIds.push(tmdbId);
    }
  });

  console.log(`Cache hit: ${cachedResults.length}/${tmdbIds.length}, fetching ${uncachedIds.length} from API`);

  if (uncachedIds.length === 0) {
    return cachedResults;
  }

  try {
    const { data, error } = await supabase.functions.invoke('streaming-availability-pro', {
      body: {
        tmdbIds: uncachedIds,
        country: targetCountry,
        mode
      }
    });

    if (error) throw error;

    const response = data as StreamingBatchResponse;
    
    if (!response.success) {
      throw new Error('API call failed');
    }

    // Cache the new results
    response.data.forEach(movieData => {
      setCachedData(movieData.tmdbId, targetCountry, movieData);
    });

    // Combine cached and new results
    const allResults = [...cachedResults, ...response.data];
    
    console.log(`Streaming data fetched: ${response.totalFound}/${response.totalProcessed} movies have streaming options`);
    
    return allResults;

  } catch (error) {
    console.error('Error fetching streaming data:', error);
    
    // Return cached results even if API fails
    if (cachedResults.length > 0) {
      console.log('Returning cached results due to API error');
      return cachedResults;
    }
    
    // Return empty results with proper structure for uncached movies
    return uncachedIds.map(tmdbId => ({
      tmdbId,
      title: '',
      streamingOptions: [],
      availableServices: [],
      hasStreaming: false,
      lastUpdated: new Date().toISOString()
    }));
  }
};

// Get streaming data for a single movie
export const getStreamingAvailabilitySingle = async (
  tmdbId: number,
  country?: string
): Promise<MovieStreamingData | null> => {
  const results = await getStreamingAvailabilityBatch([tmdbId], 'lazy', country);
  return results.length > 0 ? results[0] : null;
};

// Get supported streaming services by country
export const getSupportedServices = (country: string): string[] => {
  const servicesByCountry: Record<string, string[]> = {
    'pl': ['Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Canal+', 'Player.pl', 'Polsat Box Go', 'TVP VOD'],
    'us': ['Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Hulu', 'Paramount+', 'Peacock', 'Showtime', 'Starz']
  };
  
  return servicesByCountry[country] || servicesByCountry['us'];
};

// Clean old cache entries
export const cleanCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          const age = Date.now() - new Date(data.timestamp).getTime();
          if (age > CACHE_DURATION) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
};

// Auto-clean cache on startup
cleanCache();
