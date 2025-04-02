
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";
import axios from 'axios';
import i18n from "@/i18n";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory cache for the current session
const localCache: Record<string, StreamingAvailabilityCache> = {};

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

    const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
    
    if (error?.status === 429 || error?.message?.includes('429')) {
      const retryAfter = (errorBody?.retryAfter || 60) * 1000;
      console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
      await sleep(retryAfter);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Implementation using the Movie of the Night Streaming Availability API v4
async function fetchStreamingAvailabilityAPI(
  tmdbId: number,
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    // Check local memory cache first
    const cacheKey = `${tmdbId}-${country}`;
    if (localCache[cacheKey] && (Date.now() - localCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log('Using memory cached streaming data for:', tmdbId);
      return localCache[cacheKey].data;
    }
    
    // API key for Streaming Availability
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    // Request options according to Movie of the Night v4 API documentation
    const options = {
      method: 'GET',
      url: 'https://streaming-availability.p.rapidapi.com/v4/title',
      params: {
        tmdb_id: tmdbId,
        output_language: i18n.language || 'en',
        country: country.toLowerCase()
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    };

    console.log(`Fetching Movie of the Night API v4 for TMDB ID: ${tmdbId} in country: ${country}`);
    const response = await axios.request(options);
    console.log('Got response from Movie of the Night API v4', { status: response.status });
    
    const data = response.data;
    console.log('API Response structure:', Object.keys(data));
    
    if (!data) {
      console.log('Empty or invalid response from Movie of the Night API');
      throw new Error('Empty or invalid response from Movie of the Night API');
    }
    
    // Convert API response to StreamingPlatformData format
    const streamingPlatforms: StreamingPlatformData[] = [];
    
    // In v4, the streaming info is in the `streamingInfo` property
    if (data.streamingInfo && Object.keys(data.streamingInfo).length > 0) {
      console.log('Found streamingInfo in response with providers:', Object.keys(data.streamingInfo));
      
      // Iterate through each streaming service provider
      for (const [providerName, countriesData] of Object.entries(data.streamingInfo)) {
        // Check if data exists for the requested country
        if (countriesData[country.toLowerCase()]) {
          const providerData = countriesData[country.toLowerCase()];
          
          streamingPlatforms.push({
            service: providerName,
            available: true,
            link: providerData.link || `https://${providerName.toLowerCase()}.com`,
            startDate: providerData.availableSince || new Date().toISOString(),
            endDate: providerData.leavingDate,
            logo: getStreamingServiceLogo(providerName),
            type: providerData.type || 'subscription',
            source: 'movie-of-the-night-v4'
          });
        }
      }
      
      console.log(`Found ${streamingPlatforms.length} streaming platforms using v4 API`);
    }

    // Save to local cache
    localCache[cacheKey] = {
      data: streamingPlatforms,
      timestamp: Date.now()
    };
    
    // Cache results in the database
    await cacheResults(streamingPlatforms, tmdbId, country);
    
    return streamingPlatforms;
  } catch (error) {
    console.error('Error fetching from Movie of the Night API v4:', error);
    throw error;
  }
}

// Helper to get streaming service logo
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
    'amazonprime': '/streaming-icons/prime.svg'
  };

  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '');
  return serviceMap[normalizedName] || '/streaming-icons/default.svg';
}

export async function getStreamingAvailability(
  tmdbId: number,
  title?: string,
  year?: string,
  country?: string
): Promise<StreamingPlatformData[]> {
  try {
    console.log('Starting getStreamingAvailability for movie:', tmdbId, title);
    // Determine country based on language or parameter
    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    console.log('Using country for streaming search:', streamingCountry);
    
    // First check cache with proper handling of expired data
    const { data: cachedServices, error: cacheError } = await supabase
      .from('movie_streaming_availability')
      .select(`
        streaming_services:service_id(
          name,
          logo_url
        )
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', streamingCountry)
      .gte('available_since', new Date(Date.now() - CACHE_DURATION).toISOString());

    if (cachedServices?.length > 0) {
      console.log('Using cached streaming data from DB for movie:', tmdbId);
      return cachedServices.map(item => ({
        service: item.streaming_services.name,
        link: `https://${item.streaming_services.name.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
        logo: item.streaming_services.logo_url,
        available: true,
        startDate: new Date().toISOString(),
        source: 'database-cache'
      }));
    }

    console.log('Fetching fresh streaming data for movie:', tmdbId);
    
    // Use Movie of the Night Streaming Availability API v4
    try {
      const streamingResults = await fetchStreamingAvailabilityAPI(tmdbId, streamingCountry);
      
      if (streamingResults && streamingResults.length > 0) {
        console.log('Returning streaming results from Movie of the Night API v4:', streamingResults);
        return streamingResults;
      } else {
        console.log('No streaming results from Movie of the Night API v4 for movie:', tmdbId);
      }
    } catch (error) {
      console.error('Error with Movie of the Night API v4, trying fallbacks:', error);
      // Continue to fallback methods
    }
    
    // If all fails, try the fallback methods from the original code
    // Watchmode fallback
    try {
      console.log('Trying Watchmode API for movie:', tmdbId);
      const watchmodeResults = await getWatchmodeStreamingAvailability(tmdbId);
      
      if (watchmodeResults && watchmodeResults.length > 0) {
        console.log('Got results from Watchmode:', watchmodeResults);
        await cacheResults(watchmodeResults, tmdbId, streamingCountry);
        return watchmodeResults;
      }
    } catch (error) {
      console.error('Watchmode API error:', error);
    }
    
    // DeepSeek fallback
    try {
      console.log('Trying DeepSeek fallback for movie:', tmdbId);
      const deepseekResponse = await retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-deepseek', {
          body: { tmdbId, title, year, country: streamingCountry },
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.data) {
          throw new Error('Empty response from DeepSeek API');
        }
        
        return response.data?.result || [];
      });

      if (deepseekResponse && deepseekResponse.length > 0) {
        console.log('Got results from DeepSeek:', deepseekResponse);
        await cacheResults(deepseekResponse, tmdbId, streamingCountry);
        return deepseekResponse;
      }
    } catch (error) {
      console.error('DeepSeek API error:', error);
    }

    // Gemini fallback
    await sleep(1000);

    try {
      console.log('Trying Gemini fallback for movie:', tmdbId);
      const geminiResponse = await retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-gemini', {
          body: { tmdbId, title, year, country: streamingCountry },
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.data) {
          throw new Error('Empty response from Gemini API');
        }
        
        return response.data?.result || [];
      });

      if (geminiResponse && geminiResponse.length > 0) {
        console.log('Got results from Gemini:', geminiResponse);
        await cacheResults(geminiResponse, tmdbId, streamingCountry);
        return geminiResponse;
      }
    } catch (error) {
      console.error('Gemini API error:', error);
    }
    
    console.log('No streaming providers found for movie:', tmdbId);
    return [];
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return [];
  }
}

// Import watchmode service
async function getWatchmodeStreamingAvailability(tmdbId: number): Promise<StreamingPlatformData[]> {
  try {
    // Implementacja watchmode jest w innym pliku, więc tutaj używamy pustej implementacji
    // aby unikać błędów kompilacji
    return [];
  } catch (error) {
    console.error('Error in Watchmode fallback:', error);
    return [];
  }
}

async function cacheResults(services: StreamingPlatformData[], tmdbId: number, country: string) {
  try {
    if (services && services.length > 0) {
      const { data: streamingServices } = await supabase
        .from('streaming_services')
        .select('id, name')
        .in('name', services.map(s => s.service));

      if (streamingServices?.length > 0) {
        const serviceMap = new Map(streamingServices.map(s => [s.name.toLowerCase(), s.id]));
        
        const availabilityRecords = services.map(service => ({
          tmdb_id: tmdbId,
          service_id: serviceMap.get(service.service.toLowerCase()),
          region: country,
          available_since: new Date().toISOString()
        })).filter(record => record.service_id !== undefined);

        if (availabilityRecords.length > 0) {
          const { error } = await supabase
            .from('movie_streaming_availability')
            .upsert(availabilityRecords, {
              onConflict: 'tmdb_id,service_id,region'
            });

          if (error) {
            console.error('Error caching streaming results:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error caching streaming results:', error);
  }
}
