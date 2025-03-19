
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData } from "@/types/streaming";

export const getStreamingServicesByRegion = async (region: string) => {
  const { data: services, error } = await supabase
    .from('streaming_services')
    .select('*')
    .filter('regions', 'cs', `{${region.toLowerCase()}}`);

  if (error) {
    console.error('Error fetching streaming services:', error);
    return [];
  }

  return services;
};

export const languageToRegion: { [key: string]: string } = {
  pl: 'pl',
  en: 'en',
  // Add other language mappings as needed
};

// Add the missing formatServiceLinks function
export const formatServiceLinks = (services: StreamingPlatformData[]): StreamingPlatformData[] => {
  return services.map(service => {
    // Ensure link property exists and is properly formatted
    if (!service.link) {
      const normalizedServiceName = service.service.toLowerCase()
        .replace(/\+/g, 'plus')
        .replace(/\s/g, '');
      
      service.link = `https://${normalizedServiceName}.com`;
    }
    
    return service;
  });
};
