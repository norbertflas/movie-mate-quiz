import { supabase } from "@/integrations/supabase/client";

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
      .eq('movie_id', tmdbId)
      .eq('region', country);

    if (cachedData?.length > 0) {
      return cachedData.map(item => ({
        service: item.streaming_services.name,
        link: `https://${item.streaming_services.name.toLowerCase()}.com/watch/${tmdbId}`,
        logo: item.streaming_services.logo_url
      }));
    }

    // If no cached data, try the regular streaming availability API
    const { data: regularData, error: regularError } = await supabase
      .functions.invoke('streaming-availability', {
        body: { tmdbId, country }
      });

    // Then, try the Gemini-powered availability check
    const { data: geminiData, error: geminiError } = await supabase
      .functions.invoke('streaming-availability-gemini', {
        body: { tmdbId, title, year, country }
      });

    // Handle various error cases
    if (regularError && geminiError) {
      console.error('Both APIs failed:', { regularError, geminiError });
      return [];
    }

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
          movie_id: tmdbId,
          service_id: serviceMap.get(service.service.toLowerCase()),
          region: country,
          available_since: new Date().toISOString()
        }));

        await supabase
          .from('movie_streaming_availability')
          .upsert(availabilityRecords);
      }
    }

    return uniqueServices.map(info => ({
      service: info.service,
      link: info.link || `https://${info.service.toLowerCase()}.com/watch/${tmdbId}`,
      logo: `/streaming-icons/${info.service.toLowerCase()}.svg`
    }));
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return [];
  }
}

export async function searchByStreaming(
  services: string[],
  country: string = 'us'
): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('movie_streaming_availability')
      .select('movie_id, streaming_services!inner(name)')
      .in('streaming_services.name', services)
      .eq('region', country);

    if (error) {
      console.error('Error searching streaming movies:', error);
      return [];
    }

    return data?.map(item => item.movie_id) || [];
  } catch (error) {
    console.error('Error searching streaming movies:', error);
    return [];
  }
}