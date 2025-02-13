
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

export async function getStreamingAvailability(tmdbId: number, title?: string, year?: string, country: string = 'us'): Promise<StreamingService[]> {
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
        link: `https://${item.streaming_services.name.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
        logo: item.streaming_services.logo_url
      }));
    }

    console.log('Fetching fresh streaming data for movie:', tmdbId);
    
    // Try both APIs in parallel with error handling
    const results = await Promise.allSettled([
      retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-gemini', {
          body: { tmdbId, title, year, country }
        });
        return response.data?.result || [];
      }),
      retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-deepseek', {
          body: { tmdbId, title, year, country }
        });
        return response.data?.result || [];
      })
    ]);

    // Combine successful results
    const services = new Set<StreamingService>();
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        result.value.forEach((s: StreamingService) => {
          if (s && s.service && s.link) {
            services.add({
              service: s.service,
              link: s.link,
              logo: s.logo
            });
          }
        });
      }
    });

    const serviceArray = Array.from(services);
    console.log('Combined streaming services found:', serviceArray);

    if (serviceArray.length > 0) {
      // Cache the results
      const { data: streamingServices } = await supabase
        .from('streaming_services')
        .select('id, name')
        .in('name', serviceArray.map(s => s.service));

      if (streamingServices?.length > 0) {
        const serviceMap = new Map(streamingServices.map(s => [s.name.toLowerCase(), s.id]));
        
        const availabilityRecords = serviceArray.map(service => ({
          tmdb_id: tmdbId,
          service_id: serviceMap.get(service.service.toLowerCase()),
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

    return serviceArray;
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return [];
  }
}
