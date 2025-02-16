
import { supabase } from "@/integrations/supabase/client";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type StreamingService = {
  service: string;
  link: string;
  logo?: string;
};

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

    // Parse error body if it's a string
    const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
    
    if (error?.status === 429 || error?.message?.includes('429')) {
      const retryAfter = (errorBody?.retryAfter || 60) * 1000;
      console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
      await sleep(retryAfter);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    console.log(`Error occurred, retrying in ${delay}ms`);
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

export async function getStreamingAvailability(tmdbId: number, title?: string, year?: string, country: string = 'us'): Promise<StreamingService[]> {
  try {
    // Check cache first with proper handling of expired data
    const { data: cachedServices, error: cacheError } = await supabase
      .from('movie_streaming_availability')
      .select(`
        streaming_services:service_id(
          name,
          logo_url
        )
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', country)
      .gte('available_since', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (cachedServices?.length > 0) {
      console.log('Using cached streaming data for movie:', tmdbId);
      return cachedServices.map(item => ({
        service: item.streaming_services.name,
        link: `https://${item.streaming_services.name.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
        logo: item.streaming_services.logo_url
      }));
    }

    console.log('Fetching fresh streaming data for movie:', tmdbId);
    
    // Try DeepSeek first as it seems more reliable
    try {
      const deepseekResponse = await retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-deepseek', {
          body: { tmdbId, title, year, country },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.data) {
          throw new Error('Empty response from DeepSeek API');
        }
        
        return response.data?.result || [];
      });

      if (deepseekResponse.length > 0) {
        await cacheResults(deepseekResponse, tmdbId, country);
        return deepseekResponse;
      }
    } catch (error) {
      console.error('DeepSeek API error:', error);
    }

    // Try Gemini as fallback with a delay
    await sleep(1000); // Add delay before trying Gemini

    try {
      const geminiResponse = await retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-gemini', {
          body: { tmdbId, title, year, country },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.data) {
          throw new Error('Empty response from Gemini API');
        }
        
        return response.data?.result || [];
      });

      if (geminiResponse.length > 0) {
        await cacheResults(geminiResponse, tmdbId, country);
        return geminiResponse;
      }
    } catch (error) {
      console.error('Gemini API error:', error);
    }

    return [];
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return [];
  }
}

async function cacheResults(services: StreamingService[], tmdbId: number, country: string) {
  try {
    if (services.length > 0) {
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
