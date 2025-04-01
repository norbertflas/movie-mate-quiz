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
    
    // Try all possible API variants in order according to documentation
    
    // Variant 1: /v2/get/basic (new endpoint according to documentation)
    try {
      const result = await tryBasicEndpoint(tmdbId, streamingCountry, rapidApiKey);
      if (result && result.length > 0) {
        return result;
      }
    } catch (e: any) {
      console.error('[ts-streaming] Basic endpoint failed:', e.message);
      // If we hit a 502 error, no need to try other endpoints
      if (e.response?.status === 502) {
        console.error('[ts-streaming] Server error 502 detected from API');
        throw new Error('streaming_server_error_502');
      }
    }
    
    // Variant 2: /v2/get/movie (alternative endpoint format)
    try {
      const result = await tryMovieEndpoint(tmdbId, streamingCountry, rapidApiKey);
      if (result && result.length > 0) {
        return result;
      }
    } catch (e: any) {
      console.error('[ts-streaming] Movie endpoint failed:', e.message);
      if (e.response?.status === 502) {
        console.error('[ts-streaming] Server error 502 detected from API');
        throw new Error('streaming_server_error_502');
      }
    }
    
    // Variant 3: /get/basic (old API format)
    try {
      const result = await tryLegacyEndpoint(tmdbId, streamingCountry, rapidApiKey);
      if (result && result.length > 0) {
        return result;
      }
    } catch (e: any) {
      console.error('[ts-streaming] Legacy endpoint failed:', e.message);
      if (e.response?.status === 502) {
        console.error('[ts-streaming] Server error 502 detected from API');
        throw new Error('streaming_server_error_502');
      }
    }
    
    console.log('[ts-streaming] No streaming data found after trying all endpoints');
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
 * Try the new v2/get/basic endpoint
 */
async function tryBasicEndpoint(
  tmdbId: number,
  country: string,
  apiKey: string
): Promise<StreamingPlatformData[]> {
  console.log('[ts-streaming] Trying /v2/get/basic endpoint...');
  
  const options = {
    method: 'GET',
    url: `${API_BASE_URL}/v2/get/basic`,
    params: {
      tmdb_id: tmdbId,
      country: country
    },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
    }
  };
  
  const response = await axios.request(options);
  
  if (response.data?.result?.streamingInfo?.[country]) {
    const services = response.data.result.streamingInfo[country];
    console.log(`[ts-streaming] Found ${services.length} services via basic endpoint`);
    
    return services.map(option => ({
      service: option.service,
      available: true,
      link: option.link || `https://${option.service.toLowerCase()}.com`,
      startDate: option.availableSince,
      endDate: option.leavingDate,
      logo: getStreamingServiceLogo(option.service),
      type: option.streamingType
    }));
  }
  
  return [];
}

/**
 * Try the /v2/get/movie endpoint (alternative format)
 */
async function tryMovieEndpoint(
  tmdbId: number,
  country: string,
  apiKey: string
): Promise<StreamingPlatformData[]> {
  console.log('[ts-streaming] Trying /v2/get/movie endpoint...');
  
  const options = {
    method: 'GET',
    url: `${API_BASE_URL}/v2/get/movie`,
    params: {
      tmdb_id: tmdbId,
      country: country
    },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
    }
  };
  
  const response = await axios.request(options);
  
  if (response.data?.result?.streamingInfo?.[country]) {
    const countryInfo = response.data.result.streamingInfo[country];
    const services: StreamingPlatformData[] = [];
    
    // In this format the data is structured as an object of services with arrays of options
    for (const [serviceName, serviceOptions] of Object.entries(countryInfo)) {
      if (Array.isArray(serviceOptions) && serviceOptions.length > 0) {
        const option = serviceOptions[0];
        
        services.push({
          service: serviceName,
          available: true,
          link: option.link || `https://${serviceName.toLowerCase()}.com`,
          startDate: option.availableSince,
          endDate: option.leavingDate,
          logo: getStreamingServiceLogo(serviceName),
          type: option.streamingType
        });
      }
    }
    
    console.log(`[ts-streaming] Found ${services.length} services via movie endpoint`);
    return services;
  }
  
  return [];
}

/**
 * Try the legacy /get/basic endpoint (older API version)
 */
async function tryLegacyEndpoint(
  tmdbId: number,
  country: string,
  apiKey: string
): Promise<StreamingPlatformData[]> {
  console.log('[ts-streaming] Trying legacy endpoint...');
  
  const options = {
    method: 'GET',
    url: `${API_BASE_URL}/get/basic`,
    params: {
      tmdb_id: `movie/${tmdbId}`,
      country: country
    },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
    }
  };
  
  const response = await axios.request(options);
  
  if (response.data?.result?.streamingInfo?.[country]) {
    const services = response.data.result.streamingInfo[country];
    console.log(`[ts-streaming] Found ${services.length} services via legacy endpoint`);
    
    return services.map(option => ({
      service: option.service,
      available: true,
      link: option.link || `https://${option.service.toLowerCase()}.com`,
      startDate: option.availableSince,
      endDate: option.leavingDate,
      logo: getStreamingServiceLogo(option.service),
      type: option.streamingType
    }));
  }
  
  return [];
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
      url: `${API_BASE_URL}/v2/search/title`,
      params: {
        title,
        country: streamingCountry,
        show_type: 'movie',
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