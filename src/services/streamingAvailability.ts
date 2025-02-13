
import { supabase } from "@/integrations/supabase/client";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) {
      throw error;
    }

    if (error?.message?.includes('429')) {
      const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
      const retryAfter = (errorBody?.retryAfter || 60) * 1000;
      console.log(`Rate limit hit, waiting ${retryAfter}ms as specified by the server`);
      await sleep(retryAfter);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    console.log(`Error occurred, retrying in ${delay}ms`);
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

export async function getStreamingAvailability(tmdbId: number, title?: string, year?: string, country: string = 'us'): Promise<Array<{ service: string; link: string; logo?: string }>> {
  try {
    const { data: cachedServices, error: cacheError } = await supabase
      .from('movie_streaming_availability')
      .select(`
        streaming_services:service_id(
          name,
          logo_url
        )
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', country);

    if (cachedServices?.length > 0) {
      console.log('Using cached streaming data for movie:', tmdbId);
      return cachedServices.map(item => ({
        service: item.streaming_services.name,
        link: `https://${item.streaming_services.name.toLowerCase()}.com/watch/${tmdbId}`,
        logo: item.streaming_services.logo_url
      }));
    }

    console.log('Fetching fresh streaming data for movie:', tmdbId);
    
    // Try both APIs in parallel
    const [geminiResponse, deepseekResponse] = await Promise.allSettled([
      retryWithBackoff(async () => {
        return await supabase.functions.invoke('streaming-availability-gemini', {
          body: { tmdbId, title, year, country }
        });
      }),
      retryWithBackoff(async () => {
        return await supabase.functions.invoke('streaming-availability-deepseek', {
          body: { tmdbId, title, year, country }
        });
      })
    ]);

    // Combine results from both APIs
    const services = new Set<string>();
    
    if (geminiResponse.status === 'fulfilled' && geminiResponse.value.data?.result) {
      geminiResponse.value.data.result.forEach((s: any) => services.add(s.service));
    }
    
    if (deepseekResponse.status === 'fulfilled' && deepseekResponse.value.data?.result) {
      deepseekResponse.value.data.result.forEach((s: any) => services.add(s.service));
    }

    const serviceArray = Array.from(services);
    console.log('Combined streaming services found:', serviceArray);

    if (serviceArray.length > 0) {
      const { data: streamingServices } = await supabase
        .from('streaming_services')
        .select('id, name')
        .in('name', serviceArray);

      if (streamingServices?.length > 0) {
        const serviceMap = new Map(streamingServices.map(s => [s.name.toLowerCase(), s.id]));
        
        const availabilityRecords = serviceArray.map(service => ({
          tmdb_id: tmdbId,
          service_id: serviceMap.get(service.toLowerCase()),
          region: country,
          available_since: new Date().toISOString()
        })).filter(record => record.service_id !== undefined);

        if (availabilityRecords.length > 0) {
          await supabase
            .from('movie_streaming_availability')
            .upsert(availabilityRecords, {
              onConflict: 'tmdb_id,service_id,region'
            });
        }
      }
    }

    return serviceArray.map(service => ({
      service,
      link: `https://${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
      logo: `/streaming-icons/${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.svg`
    }));
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    throw error;
  }
}
