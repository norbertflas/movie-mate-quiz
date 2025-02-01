import { supabase } from "@/integrations/supabase/client";

export async function getStreamingAvailability(tmdbId: number, title?: string, year?: string, country: string = 'us') {
  try {
    // First, try the regular streaming availability API
    const { data: regularData, error: regularError } = await supabase
      .functions.invoke('streaming-availability', {
        body: { tmdbId, country }
      });

    // Then, try the Gemini-powered availability check
    const { data: geminiData, error: geminiError } = await supabase
      .functions.invoke('streaming-availability-gemini', {
        body: { tmdbId, title, year, country }
      });

    if (regularError && geminiError) {
      console.error('Error fetching streaming availability:', regularError || geminiError);
      return [];
    }

    // Combine and deduplicate results from both sources
    const regularServices = regularData?.result?.[0]?.streamingInfo?.[country] || [];
    const geminiServices = geminiData?.result || [];

    const allServices = [...regularServices, ...geminiServices];
    
    // Deduplicate services by name
    const uniqueServices = Array.from(
      new Map(allServices.map(item => [item.service.toLowerCase(), item]))
      .values()
    );

    return uniqueServices.map(info => ({
      service: info.service,
      link: info.link,
      availableSince: info.availableSince,
      country,
      needsVpn: false
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
      .functions.invoke('streaming-availability', {
        body: { services, country }
      });

    if (error) {
      console.error('Error searching streaming movies:', error);
      return [];
    }

    return data?.result?.map((movie: any) => movie.tmdbId) || [];
  } catch (error) {
    console.error('Error searching streaming movies:', error);
    return [];
  }
}