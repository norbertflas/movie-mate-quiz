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

    // Handle various error cases from Gemini API
    if (geminiError) {
      console.error('Gemini API Error:', geminiError);
      
      // If it's a rate limit error or content safety error, fall back to regular data
      if (geminiError.status === 429 || geminiError.status === 422) {
        const errorMessage = geminiError.status === 429 
          ? 'Gemini API rate limit reached, falling back to regular data only'
          : 'Content safety check failed, falling back to regular data only';
        console.log(errorMessage);
        
        // If we have regular data, return it
        if (regularData?.result?.[0]?.streamingInfo?.[country]) {
          return regularData.result[0].streamingInfo[country];
        }
        
        // Otherwise return empty array
        return [];
      }
    }

    // Get services from both sources
    const regularServices = regularData?.result?.[0]?.streamingInfo?.[country] || [];
    // Only include Gemini services if there was no error or it wasn't a rate limit/safety error
    const geminiServices = (!geminiError || ![429, 422].includes(geminiError.status)) 
      ? (geminiData?.result || []) 
      : [];

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
