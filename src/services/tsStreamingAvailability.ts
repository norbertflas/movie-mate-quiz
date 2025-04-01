import axios from 'axios';
import type { StreamingPlatformData } from "@/types/streaming";
import i18n from "@/i18n";

// Base URL for the streaming availability API - upewnij się, że używasz najnowszej wersji API
const API_BASE_URL = 'https://streaming-availability.p.rapidapi.com';

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

interface StreamingResultV2 {
  result: {
    type: string;
    title: string;
    streamingInfo: Record<string, Record<string, StreamingInfo[]>>;
  };
}

interface StreamingResultV3 {
  result: {
    type: string;
    title: string;
    streamingInfo: {
      [country: string]: Array<{
        service: string;
        streamingType: string;
        link: string;
        availableSince?: string;
        leavingDate?: string;
      }>;
    };
  };
}

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
    // Sprawdź, czy mamy poprawne ID filmu
    if (!tmdbId || tmdbId <= 0) {
      console.log('[ts-streaming] Invalid TMDB ID:', tmdbId);
      return [];
    }

    // Determine country based on the current language
    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    
    console.log(`[ts-streaming] Fetching availability for TMDB ID: ${tmdbId} in country: ${streamingCountry}`);
    
    // RapidAPI key - should be stored in environment variable in production
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    // Najpierw spróbuj API v3 (najnowsze) z parametrem movie/{tmdbId}
    try {
      const options = {
        method: 'GET',
        url: `${API_BASE_URL}/get/basic`,
        params: {
          tmdb_id: `movie/${tmdbId}`,
          country: streamingCountry
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      
      if (response.data?.result?.streamingInfo?.[streamingCountry]) {
        const services = response.data.result.streamingInfo[streamingCountry];
        const streamingPlatforms: StreamingPlatformData[] = [];
        
        for (const option of services) {
          streamingPlatforms.push({
            service: option.service,
            available: true,
            link: option.link || `https://${option.service.toLowerCase()}.com`,
            startDate: option.availableSince || new Date().toISOString(),
            endDate: option.leavingDate,
            logo: getStreamingServiceLogo(option.service),
            type: option.streamingType || 'subscription'
          });
        }
        
        console.log(`[ts-streaming] Found ${streamingPlatforms.length} streaming platforms`);
        return streamingPlatforms;
      }
    } catch (v3Error) {
      console.error('[ts-streaming] Error with API v3:', v3Error);
    }
    
    // Zapasowa metoda - spróbuj alternatywnego API endpoint (v2 lub starszy)
    try {
      const options = {
        method: 'GET',
        url: `${API_BASE_URL}/v2/get/movie`,
        params: {
          tmdb_id: tmdbId,
          country: streamingCountry
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      
      if (response.data?.result?.streamingInfo) {
        const streamingInfo = response.data.result.streamingInfo;
        const countryToUse = streamingInfo[streamingCountry] ? 
          streamingCountry : 
          Object.keys(streamingInfo)[0];
          
        if (streamingInfo[countryToUse]) {
          const streamingPlatforms: StreamingPlatformData[] = [];
          
          for (const [serviceName, options] of Object.entries(streamingInfo[countryToUse])) {
            if (Array.isArray(options) && options.length > 0) {
              const option = options[0];
              
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
          
          console.log(`[ts-streaming] Found ${streamingPlatforms.length} streaming platforms with v2 API`);
          return streamingPlatforms;
        }
      }
    } catch (v2Error) {
      console.error('[ts-streaming] Error with API v2:', v2Error);
    }
    
    return [];
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