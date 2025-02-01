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

    // Log errors for debugging
    if (regularError) {
      console.error('Regular API Error:', regularError);
    }
    if (geminiError) {
      console.error('Gemini API Error:', geminiError);
      // If it's a rate limit error, just log it and continue with regular data
      if (geminiError.status === 429) {
        console.log('Gemini API rate limit reached, falling back to regular data only');
      }
    }

    // If both APIs fail with non-rate-limit errors, return an empty array
    if (regularError && (geminiError && geminiError.status !== 429)) {
      return [];
    }

    // Get services from both sources
    const regularServices = regularData?.result?.[0]?.streamingInfo?.[country] || [];
    // Only include Gemini services if there was no error or it wasn't a rate limit error
    const geminiServices = (!geminiError || geminiError.status === 429) ? (geminiData?.result || []) : [];

    console.log('Regular services:', regularServices);
    console.log('Gemini services:', geminiServices);

    // Combine and deduplicate results from both sources
    const allServices = [...regularServices, ...geminiServices];
    
    // Deduplicate services by name
    const uniqueServices = Array.from(
      new Map(allServices.map(item => [item.service.toLowerCase(), item]))
      .values()
    );

    console.log('Combined unique services:', uniqueServices);

    return uniqueServices.map(info => ({
      service: info.service,
      link: info.link,
      availableSince: info.availableSince,
      country,
      needsVpn: false
    }));
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    // Return empty array instead of throwing to prevent UI disruption
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