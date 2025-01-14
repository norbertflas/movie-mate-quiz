import { supabase } from "@/integrations/supabase/client";

export async function getStreamingAvailability(tmdbId: number, country: string = 'us'): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .functions.invoke('streaming-availability', {
        body: { tmdbId, country }
      });

    if (error) {
      console.error('Error fetching streaming availability:', error);
      return [];
    }

    const streamingInfo = data?.result?.[0]?.streamingInfo?.[country] || [];
    return streamingInfo.map((info: any) => ({
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