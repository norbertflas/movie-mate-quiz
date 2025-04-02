
import axios from 'axios';
import type { StreamingPlatformData } from "@/types/streaming";
import i18n from "@/i18n";

// Base URL for the streaming availability API
const API_BASE_URL = 'https://streaming-availability.p.rapidapi.com';

/**
 * Get streaming availability for a movie from the API
 */
export async function getTsStreamingAvailability(
  tmdbId: number,
  country?: string
): Promise<StreamingPlatformData[]> {
  try {
    if (!tmdbId || tmdbId <= 0) {
      console.log('[ts-streaming] Invalid TMDB ID:', tmdbId);
      return [];
    }

    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    
    // RapidAPI key
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    console.log(`[ts-streaming] Fetching streaming data for TMDB ID ${tmdbId}, Country: ${streamingCountry}`);
    
    // Use the v4 API
    try {
      console.log('[ts-streaming] Using v4 API endpoint...');
      
      const options = {
        method: 'GET',
        url: `${API_BASE_URL}/v4/title`,
        params: {
          tmdb_id: tmdbId,
          country: streamingCountry.toLowerCase()
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      };
      
      const response = await axios.request(options);
      console.log('[ts-streaming] v4 API response status:', response.status);
      
      if (response.data?.streamingInfo) {
        const streamingInfo = response.data.streamingInfo;
        const services: StreamingPlatformData[] = [];
        
        for (const [providerName, countriesData] of Object.entries(streamingInfo)) {
          if (countriesData[streamingCountry.toLowerCase()]) {
            const providerData = countriesData[streamingCountry.toLowerCase()];
            
            services.push({
              service: providerName,
              available: true,
              link: providerData.link || `https://${providerName.toLowerCase()}.com`,
              startDate: providerData.availableSince,
              endDate: providerData.leavingDate,
              logo: getStreamingServiceLogo(providerName),
              type: providerData.type
            });
          }
        }
        
        console.log(`[ts-streaming] Found ${services.length} services via v4 API`);
        return services;
      } else {
        console.log('[ts-streaming] No streaming info found in v4 API response');
      }
    } catch (e: any) {
      console.error('[ts-streaming] v4 API failed:', e.message);
      if (e.response?.status === 502) {
        console.error('[ts-streaming] Server error 502 detected from API');
        throw new Error('streaming_server_error_502');
      } else if (e.response?.status === 429) {
        console.error('[ts-streaming] Rate limit exceeded detected from API');
        throw new Error('streaming_rate_limit_exceeded');
      }
    }
    
    console.log('[ts-streaming] No streaming data found after trying v4 API');
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
 */
export async function searchMoviesWithStreaming(
  title: string, 
  country?: string
): Promise<any[]> {
  try {
    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    const options = {
      method: 'GET',
      url: `${API_BASE_URL}/v4/search/title`,
      params: {
        title,
        country: streamingCountry.toLowerCase(),
        type: 'movie',
        output_language: currentLang
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    };

    console.log(`[ts-streaming] Searching for title: "${title}" in country: ${streamingCountry}`);
    
    try {
      const response = await axios.request(options);
      
      if (!response.data?.result || !Array.isArray(response.data.result)) {
        console.log('[ts-streaming] Search returned no results');
        return [];
      }
      
      console.log(`[ts-streaming] Search found ${response.data.result.length} results`);
      return response.data.result;
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
    
    return [];
  }
}
