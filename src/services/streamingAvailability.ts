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
    if (retries === 0 || !error?.message?.includes('429')) {
      throw error;
    }
    console.log(`Rate limit hit, waiting ${delay}ms before retry ${retries}`);
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

export async function getStreamingAvailability(tmdbId: number, title?: string, year?: string, country: string = 'us') {
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
    const response = await retryWithBackoff(async () => {
      return await supabase.functions.invoke('streaming-availability-gemini', {
        body: { tmdbId, title, year, country }
      });
    });

    const services = response.data?.result || [];
    
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
        }));

        await supabase
          .from('movie_streaming_availability')
          .upsert(availabilityRecords, {
            onConflict: 'tmdb_id,service_id,region'
          });
      }
    }

    return services.map(info => ({
      service: info.service,
      link: info.link || `https://${info.service.toLowerCase()}.com/watch/${tmdbId}`,
      logo: `/streaming-icons/${info.service.toLowerCase()}.svg`
    }));
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    throw error;
  }
}