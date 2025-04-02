
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData } from "@/types/streaming";
import { formatServiceLinks } from "@/utils/streamingServices";

/**
 * Fetch streaming availability data from Utelly API
 */
export async function fetchUtellyAvailability(
  title: string,
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`Fetching Utelly data for title: "${title}" in country: ${country}`);
    
    const response = await supabase.functions.invoke('streaming-availability-utelly', {
      body: { 
        title, 
        country 
      },
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.data || !response.data.result) {
      console.error('Empty or invalid response from Utelly API');
      return [];
    }
    
    const services = response.data.result;
    console.log(`Received ${services.length} streaming services from Utelly`);
    
    // Format the services to ensure consistent data
    return formatServiceLinks(services);
  } catch (error) {
    console.error('Error fetching from Utelly API:', error);
    return [];
  }
}

/**
 * Search for titles using Utelly API
 */
export async function searchUtellyTitles(
  query: string,
  country: string = 'us'
): Promise<any[]> {
  try {
    if (!query || query.length < 2) {
      console.log('Search query too short for Utelly API');
      return [];
    }
    
    console.log(`Searching Utelly for "${query}" in country: ${country}`);
    
    const response = await supabase.functions.invoke('streaming-availability-utelly', {
      body: { 
        title: query, 
        country,
        search: true
      },
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.data || !response.data.result || !Array.isArray(response.data.result)) {
      console.log('No search results from Utelly API');
      return [];
    }
    
    return response.data.result;
  } catch (error) {
    console.error('Error searching with Utelly API:', error);
    return [];
  }
}
