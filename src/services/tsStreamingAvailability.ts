import axios from 'axios';
import type { StreamingPlatformData } from "@/types/streaming";
import i18n from "@/i18n";

// Base URL for the streaming availability API
const API_BASE_URL = 'https://streaming-availability.p.rapidapi.com/v2';

// Types based on ts-streaming-availability library
type StreamingInfo = {
  service: string;
  streamingType: string;
  link: string;
  availableSince?: string;
  leavingDate?: string;
  quality?: string;
  audios?: Array<{
    language: string;
    region: string;
  }>;
  subtitles?: Array<{
    language: string;
    region: string;
  }>;
  price?: {
    amount: number;
    currency: string;
    formatted: string;
  };
};

type StreamingResult = {
  result: {
    type: string;
    title: string;
    streamingInfo: Record<string, Record<string, StreamingInfo[]>>;
  };
};

/**
 * Get streaming availability for a movie from the API
 * @param tmdbId The TMDB ID of the movie
 * @param country The country code to check availability for (default: based on current language)
 * @returns Array of streaming platform data
 */
export async function getTsStreamingAvailability(
  tmdbId: number,
  country?: string
): Promise<StreamingPlatformData[]> {
  try {
    // Determine country based on the current language
    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    
    console.log(`[ts-streaming] Fetching availability for TMDB ID: ${tmdbId} in country: ${streamingCountry}`);
    
    // RapidAPI key - should be stored in environment variable in production
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    // Create the request configuration
    const options = {
      method: 'GET',
      url: `${API_BASE_URL}/get/movie`,
      params: {
        tmdb_id: tmdbId,
        country: streamingCountry
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    };

    // Make the API request
    const response = await axios.request<StreamingResult>(options);
    
    if (!response.data || !response.data.result) {
      console.log('[ts-streaming] Empty or invalid response from API');
      return [];
    }
    
    const result = response.data.result;
    const streamingPlatforms: StreamingPlatformData[] = [];
    
    // Process the streaming information from the response
    if (result.streamingInfo && Object.keys(result.streamingInfo).length > 0) {
      // Get streaming info for the specified country, or fallback to the first country in the list
      const countryToUse = result.streamingInfo[streamingCountry] ? 
        streamingCountry : 
        Object.keys(result.streamingInfo)[0];
      
      if (result.streamingInfo[countryToUse]) {
        // Process each service in the country
        for (const [serviceName, options] of Object.entries(result.streamingInfo[countryToUse])) {
          if (Array.isArray(options) && options.length > 0) {
            const option = options[0]; // Take first option for each service
            
            streamingPlatforms.push({
              service: serviceName,
              available: true,
              link: option.link || `https://${serviceName.toLowerCase()}.com`,
              startDate: option.availableSince || new Date().toISOString(),
              endDate: option.leavingDate,
              logo: getStreamingServiceLogo(serviceName),
              type: option.streamingType || 'subscription'
            });
          }
        }
        
        console.log(`[ts-streaming] Found ${streamingPlatforms.length} streaming platforms`);
      }
    }
    
    return streamingPlatforms;
  } catch (error) {
    console.error('[ts-streaming] Error fetching streaming availability:', error);
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
    'amazon': '/streaming-icons/amazon.svg'
  };

  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '');
  return serviceMap[normalizedName] || '/streaming-icons/default.svg';
}

/**
 * Search for movies by title and get streaming availability
 * @param title The movie title to search for
 * @param country The country code to check availability for
 * @returns Array of movie results with streaming info
 */
export async function searchMoviesWithStreaming(
  title: string, 
  country?: string
): Promise<any[]> {
  try {
    // Determine country based on the current language
    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    
    console.log(`[ts-streaming] Searching for movie: "${title}" in country: ${streamingCountry}`);
    
    // RapidAPI key
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    // Create the request configuration
    const options = {
      method: 'GET',
      url: `${API_BASE_URL}/search/title`,
      params: {
        title: title,
        country: streamingCountry,
        show_type: 'movie',
        output_language: currentLang
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    };

    // Make the API request
    const response = await axios.request(options);
    
    if (!response.data || !response.data.result || !Array.isArray(response.data.result)) {
      console.log('[ts-streaming] Empty or invalid search response from API');
      return [];
    }
    
    return response.data.result;
  } catch (error) {
    console.error('[ts-streaming] Error searching movies with streaming:', error);
    return [];
  }
}