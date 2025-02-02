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
    // First, check our database for cached streaming info
    const { data: cachedData, error: cacheError } = await supabase
      .from('movie_streaming_availability')
      .select(`
        streaming_services:service_id(
          name,
          logo_url
        )
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', country);

    if (cachedData?.length > 0) {
      return cachedData.map(item => ({
        service: item.streaming_services.name,
        link: `https://${item.streaming_services.name.toLowerCase()}.com/watch/${tmdbId}`,
        logo: item.streaming_services.logo_url
      }));
    }

    // Try both APIs in parallel for faster results
    const [regularData, geminiData] = await Promise.all([
      retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability', {
          body: { tmdbId, country }
        });
        return response.data;
      }),
      retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-gemini', {
          body: { tmdbId, title, year, country }
        });
        return response.data;
      })
    ]);

    // Combine and deduplicate results from both sources
    const allServices = [
      ...(regularData?.result || []),
      ...(geminiData?.result || [])
    ];
    
    // Deduplicate services by name
    const uniqueServices = Array.from(
      new Map(allServices.map(item => [item.service.toLowerCase(), item]))
      .values()
    );

    // Cache the results in our database
    if (uniqueServices.length > 0) {
      const { data: services } = await supabase
        .from('streaming_services')
        .select('id, name')
        .in('name', uniqueServices.map(s => s.service));

      if (services?.length > 0) {
        const serviceMap = new Map(services.map(s => [s.name.toLowerCase(), s.id]));
        
        const availabilityRecords = uniqueServices.map(service => ({
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

    return uniqueServices.map(info => ({
      service: info.service,
      link: info.link || `https://${info.service.toLowerCase()}.com/watch/${tmdbId}`,
      logo: `/streaming-icons/${info.service.toLowerCase()}.svg`
    }));
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    throw error;
  }
}

export async function searchByStreaming(services: string[], country: string = 'us'): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('movie_streaming_availability')
      .select('tmdb_id')
      .in('service_id', services)
      .eq('region', country);

    if (error) {
      console.error('Error searching streaming movies:', error);
      return [];
    }

    return data?.map(item => item.tmdb_id) || [];
  } catch (error) {
    console.error('Error searching streaming movies:', error);
    return [];
  }
}

export async function isMovieStreamingAvailable(tmdbId: number, country: string = 'us'): Promise<boolean> {
  try {
    const services = await getStreamingAvailability(tmdbId, undefined, undefined, country);
    return services.length > 0;
  } catch (error) {
    console.error('Error checking streaming availability:', error);
    return false;
  }
}