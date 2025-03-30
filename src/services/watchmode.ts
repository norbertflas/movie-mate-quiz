import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData } from "@/types/streaming";

interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  ios_url?: string;
  android_url?: string;
  web_url?: string;
  format: string;
  price?: number;
  seasons?: number;
  episodes?: number;
}

export interface WatchmodeResponse {
  id: number;
  title: string;
  type: string;
  sources: WatchmodeSource[];
}

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error('Error in retryWithBackoff:', error);

    if (retries === 0) {
      throw error;
    }

    let retryAfter = delay;
    
    // Bezpieczne parsowanie error.body
    try {
      const errorBody = error.body ? 
        (typeof error.body === 'string' ? JSON.parse(error.body) : error.body) : 
        {};
      
      // Sprawdzenie statusu błędu z różnych możliwych lokalizacji
      const isRateLimitError = 
        error?.status === 429 || 
        error?.message?.includes('429') || 
        errorBody?.status === 429;
      
      if (isRateLimitError) {
        retryAfter = (errorBody?.retryAfter || 60) * 1000;
        console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
      }
    } catch (parseError) {
      console.error('Error parsing error body:', parseError);
    }

    await sleep(retryAfter);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Search for a movie title using Watchmode API
 */
export async function searchWatchmodeTitle(
  title: string,
  year?: string,
  region: string = 'US'
): Promise<{ id: number; name: string; type: string; year: number } | null> {
  try {
    console.log(`Searching Watchmode for title: ${title} ${year ? `(${year})` : ''} in region ${region}`);
    
    // Construct the search query
    const searchQuery = year ? `${title} ${year}` : title;
    
    // Call Supabase Edge Function to search for the title
    const { data, error } = await supabase.functions.invoke('watchmode-title-search', {
      body: { 
        searchQuery, 
        searchField: 'name',
        types: 'movie,tv_series',
        region // Dodanie parametru region
      }
    });

    if (error) {
      console.error('Error searching Watchmode title:', error);
      return null;
    }

    if (!data?.results?.length) {
      console.log('No Watchmode results found for:', title);
      return null;
    }

    console.log(`Found ${data.results.length} Watchmode results for: ${title}`);
    
    // If we have a year, try to find an exact match
    if (year && data.results.length > 1) {
      const yearNum = parseInt(year);
      const exactMatch = data.results.find((result: any) => result.year === yearNum);
      if (exactMatch) {
        console.log(`Found exact year match for ${title} (${year}):`, exactMatch);
        return exactMatch;
      }
    }
    
    // Return the first result
    return data.results[0];
  } catch (error) {
    console.error('Error in searchWatchmodeTitle:', error);
    return null;
  }
}

/**
 * Get streaming availability from Watchmode API using title ID
 */
export async function getWatchmodeTitleDetails(
  titleId: number,
  region: string = 'US'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`Fetching Watchmode details for title ID ${titleId} in region ${region}`);
    
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase.functions.invoke('watchmode-title-details', {
        body: { 
          titleId, 
          region: 'US', // Force US region for reliable data
          includeSources: true
        }
      });
    });

    if (error) {
      console.error('Error fetching Watchmode title details:', error);
      return [];
    }

    if (!data?.sources || !Array.isArray(data.sources)) {
      console.log('No streaming sources found from Watchmode for ID:', titleId);
      return [];
    }

    console.log(`Found ${data.sources.length} Watchmode streaming sources for ID: ${titleId}`);

    // Include all relevant streaming types
    const relevantSources = ['sub', 'free', 'tvod', 'addon', 'purchase', 'live'];
    
    return data.sources
      .filter((source: WatchmodeSource) => {
        // Filter out non-relevant sources and ensure proper formatting
        return relevantSources.includes(source.type.toLowerCase()) &&
               source.name && // ensure name exists
               source.source_id; // ensure source_id exists
      })
      .map((source: WatchmodeSource) => ({
        service: normalizeServiceName(source.name),
        link: source.web_url || generateServiceUrl(source.name),
        logo: `https://cdn.watchmode.com/provider_logos/${source.source_id}_100px.png`,
        available: true,
        startDate: new Date().toISOString(),
        type: source.type,
        price: source.price || undefined
      }));
  } catch (error) {
    console.error('Error in getWatchmodeTitleDetails:', error);
    return [];
  }
}

/**
 * Get streaming availability from Watchmode API using TMDB ID
 */
export async function getWatchmodeStreamingAvailability(
  tmdbId: number,
  region: string = 'US'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`Fetching Watchmode streaming availability for movie ${tmdbId} in region ${region}`);
    
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase.functions.invoke('watchmode-availability', {
        body: { 
          tmdbId, 
          region: 'US' // Force US region for reliable data
        }
      });
    });

    if (error) {
      console.error('Error fetching Watchmode data:', error);
      return [];
    }

    if (!data?.sources || !Array.isArray(data.sources)) {
      console.log('No streaming sources found from Watchmode');
      return [];
    }

    console.log(`Found ${data.sources.length} Watchmode streaming sources`);

    // Include all relevant streaming types
    const relevantSources = ['sub', 'free', 'tvod', 'addon', 'purchase', 'live'];
    
    return data.sources
      .filter(source => {
        return relevantSources.includes(source.type.toLowerCase()) &&
               source.name &&
               source.source_id;
      })
      .map(source => ({
        service: normalizeServiceName(source.name),
        link: source.web_url || generateServiceUrl(source.name),
        logo: `https://cdn.watchmode.com/provider_logos/${source.source_id}_100px.png`,
        available: true,
        startDate: new Date().toISOString(),
        type: source.type,
        price: source.price || undefined
      }));
  } catch (error) {
    console.error('Error in getWatchmodeStreamingAvailability:', error);
    return [];
  }
}

// Helper functions for service normalization
function normalizeServiceName(name: string): string {
  const serviceMap: Record<string, string> = {
    'Amazon Prime Video': 'Prime Video',
    'Amazon': 'Prime Video',
    'Disney Plus': 'Disney+',
    'HBO Max': 'Max',
    // Add more mappings as needed
  };
  return serviceMap[name] || name;
}

function generateServiceUrl(serviceName: string): string {
  const baseUrl = serviceName.toLowerCase()
    .replace(/\s+/g, '')
    .replace('plus', '+')
    .replace('amazon', 'primevideo');
  return `https://www.${baseUrl}.com`;
}
