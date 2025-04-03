import axios from 'axios';
import type { StreamingPlatformData } from "@/types/streaming";
import i18n from "@/i18n";

// Base URL for the streaming availability API
const API_BASE_URL = 'https://streaming-availability.p.rapidapi.com';

// Get API keys from environment variables
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

/**
 * Fetch the English title of a movie from TMDB API using bearer token authentication
 */
async function fetchMovieEnglishTitle(tmdbId: number): Promise<string | null> {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        language: 'en-US' // Force English language to get English title
      }
    });
    
    if (response.data && response.data.title) {
      console.log(`[ts-streaming] Found English title for TMDB ID ${tmdbId}: "${response.data.title}"`);
      return response.data.title;
    }
    return null;
  } catch (error) {
    console.error(`[ts-streaming] Error fetching English title for TMDB ID ${tmdbId}:`, error);
    return null;
  }
}

/**
 * Function to sleep/delay execution for error retries
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) {
      throw error;
    }
    
    const delay = baseDelayMs * Math.pow(2, 3 - retries);
    console.log(`Retrying after ${delay}ms, ${retries} retries left`);
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, baseDelayMs);
  }
}

/**
 * Get streaming availability for a movie from the API
 * Now uses English title for better compatibility with the Streaming Availability API
 */
export async function getTsStreamingAvailability(
  tmdbId: number,
  country?: string,
  originalTitle?: string
): Promise<StreamingPlatformData[]> {
  try {
    if (!tmdbId || tmdbId <= 0) {
      console.log('[ts-streaming] Invalid TMDB ID:', tmdbId);
      return [];
    }

    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    
    console.log(`[ts-streaming] Fetching streaming data for TMDB ID ${tmdbId}, Country: ${streamingCountry}`);
    
    // Try direct TMDB ID search first
    try {
      console.log(`[ts-streaming] Trying direct TMDB ID search: ${tmdbId}`);
      
      const options = {
        method: 'GET',
        url: `${API_BASE_URL}/v2/get/title`,
        params: {
          tmdb_id: String(tmdbId),
          country: streamingCountry.toLowerCase(),
          type: 'movie',
          output_language: currentLang
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      };
      
      const response = await retryWithBackoff(() => axios.request(options));
      
      if (response.data && response.data.result && response.data.result.streamingInfo) {
        console.log(`[ts-streaming] Direct TMDB ID search successful`);
        const services: StreamingPlatformData[] = [];
        const streamingInfo = response.data.result.streamingInfo;
        
        // Get streaming options for the current country
        const countryOptions = streamingInfo[streamingCountry.toLowerCase()];
        
        if (countryOptions && Array.isArray(countryOptions)) {
          for (const option of countryOptions) {
            services.push({
              service: option.service,
              available: true,
              link: option.link,
              startDate: option.availableSince,
              logo: getStreamingServiceLogo(option.service),
              type: option.type
            });
          }
        }
        
        console.log(`[ts-streaming] Found ${services.length} services via direct TMDB ID search`);
        return services;
      }
    } catch (e: any) {
      console.log(`[ts-streaming] Direct TMDB ID search failed, trying title search: ${e.message}`);
    }
    
    // Get the English title for the movie if direct search fails
    const englishTitle = await fetchMovieEnglishTitle(tmdbId);
    if (!englishTitle && !originalTitle) {
      console.log(`[ts-streaming] Could not get English or original title for movie ${tmdbId}`);
      return [];
    }
    
    // Use English title if available, otherwise fall back to original title
    const searchTitle = englishTitle || originalTitle || '';
    console.log(`[ts-streaming] Using search title: "${searchTitle}"`);
    
    try {
      // Search by title
      const searchResults = await searchMoviesWithStreaming(searchTitle, streamingCountry);
      
      if (searchResults && Array.isArray(searchResults.result) && searchResults.result.length > 0) {
        // Try to find exact match first
        let matchedMovie = searchResults.result.find(movie => 
          movie.tmdbId === tmdbId || 
          String(movie.tmdbId) === String(tmdbId) ||
          movie.title === searchTitle
        );
        
        // If no exact match, use the first result
        if (!matchedMovie && searchResults.result.length > 0) {
          console.log('[ts-streaming] No exact match found, using first result');
          matchedMovie = searchResults.result[0];
        }
        
        if (matchedMovie && matchedMovie.streamingInfo && matchedMovie.streamingInfo[streamingCountry.toLowerCase()]) {
          const countryStreamingOptions = matchedMovie.streamingInfo[streamingCountry.toLowerCase()];
          const services: StreamingPlatformData[] = [];
          
          for (const option of countryStreamingOptions) {
            services.push({
              service: option.service,
              available: true,
              link: option.link,
              startDate: option.availableSince,
              logo: getStreamingServiceLogo(option.service),
              type: option.type
            });
          }
          
          console.log(`[ts-streaming] Found ${services.length} services via title search`);
          return services;
        }
      }
      
      console.log('[ts-streaming] No streaming info found in search results');
      return [];
      
    } catch (e: any) {
      console.error('[ts-streaming] API search failed:', e.message);
      if (e.response?.status === 502) {
        console.error('[ts-streaming] Server error 502 detected from API');
        throw new Error('streaming_server_error_502');
      } else if (e.response?.status === 429) {
        console.error('[ts-streaming] Rate limit exceeded detected from API');
        throw new Error('streaming_rate_limit_exceeded');
      }
    }
    
    console.log('[ts-streaming] No streaming data found after trying API');
    return [];
  } catch (error: any) {
    // Handle specific error types
    if (error.message === 'streaming_server_error_502') {
      console.error('[ts-streaming] Server error 502 detected, aborting streaming check');
      throw error; // Re-throw to be handled by the hook
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('[ts-streaming] Error response:', error.response.status, error.response.data);
      
      // Handle specific HTTP status codes
      if (error.response.status === 502) {
        throw new Error('streaming_server_error_502');
      } else if (error.response.status === 429) {
        throw new Error('streaming_rate_limit_exceeded');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[ts-streaming] No response received:', error.request);
      throw new Error('streaming_no_response');
    }
    
    console.error('[ts-streaming] Error fetching streaming availability:', error.message);
    return [];
  }
}

/**
 * Helper function to get the logo URL for a streaming service
 */
function getStreamingServiceLogo(serviceName: string): string {
  const serviceMap: Record<string, string> = {
    'netflix': '/streaming-icons/netflix.svg',
    'prime': '/streaming-icons/prime.svg',
    'disney': '/streaming-icons/disney.svg',
    'disneyplus': '/streaming-icons/disneyplus.svg',
    'max': '/streaming-icons/max.svg',
    'hbo': '/streaming-icons/hbomax.svg',
    'hulu': '/streaming-icons/hulu.svg',
    'apple': '/streaming-icons/apple.svg',
    'appletv': '/streaming-icons/appletv.svg',
    'paramount': '/streaming-icons/paramount.svg',
    'amazonprime': '/streaming-icons/prime.svg',
    'amazon': '/streaming-icons/amazon.svg',
    'hbogo': '/streaming-icons/hbomax.svg',
    'hbomax': '/streaming-icons/hbomax.svg',
    'play': '/streaming-icons/default.svg',
    'player': '/streaming-icons/default.svg',
    'canal+': '/streaming-icons/default.svg',
    'canalplus': '/streaming-icons/default.svg',
  };

  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '');
  return serviceMap[normalizedName] || '/streaming-icons/default.svg';
}

/**
 * Search for movies by title and get streaming availability
 * Uses English title for better compatibility with the API
 */
export async function searchMoviesWithStreaming(
  title: string, 
  country?: string,
  englishTitle?: string
): Promise<any> {
  try {
    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    
    // Use English title if provided, otherwise use the original title
    const searchTitle = englishTitle || title;
    
    const options = {
      method: 'GET',
      url: `${API_BASE_URL}/v2/search/title`,
      params: {
        title: searchTitle,
        country: streamingCountry.toLowerCase(),
        type: 'movie',
        // Always keep output in the user's language
        output_language: currentLang
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    };

    console.log(`[ts-streaming] Searching for title: "${title}" (search using: "${searchTitle}") in country: ${streamingCountry}`);
    
    try {
      const response = await retryWithBackoff(() => axios.request(options));
      
      if (!response.data) {
        console.log('[ts-streaming] Search returned no results');
        return { result: [] };
      }
      
      console.log(`[ts-streaming] Search found ${response.data.result?.length || 0} results`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 502) {
        console.error('[ts-streaming] Server error 502 detected from API during search');
        throw new Error('streaming_server_error_502');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('[ts-streaming] Error searching movies:', error.message);
    
    if (error.message === 'streaming_server_error_502') {
      throw error; // Re-throw specific errors
    }
    
    return { result: [] };
  }
}

/**
 * Search for movies by title using English title for better results
 * This is a test function to verify if searching with English titles works better
 */
export async function searchMoviesWithEnglishTitle(
  originalTitle: string,
  englishTitle: string,
  country?: string
): Promise<any> {
  console.log(`[ts-streaming] Testing search with English title: "${englishTitle}" (original: "${originalTitle}")`);
  return searchMoviesWithStreaming(originalTitle, country, englishTitle);
}
