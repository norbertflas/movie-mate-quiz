
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData } from "@/types/streaming";

// Get streaming services by region from Supabase
export const getStreamingServicesByRegion = async (region: string) => {
  console.log(`Fetching streaming services for region: ${region}`);
  try {
    const { data: services, error } = await supabase
      .from('streaming_services')
      .select('*')
      .filter('regions', 'cs', `{${region.toLowerCase()}}`);

    if (error) {
      console.error('Error fetching streaming services:', error);
      return [];
    }

    console.log(`Found ${services?.length || 0} services for region ${region}`);
    return services || [];
  } catch (error) {
    console.error('Error in getStreamingServicesByRegion:', error);
    return [];
  }
};

// Map languages to region codes
export const languageToRegion: { [key: string]: string } = {
  pl: 'pl',
  en: 'us',
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
  // Add other language mappings as needed
};

// Add proper links to streaming services
export const formatServiceLinks = (services: StreamingPlatformData[]): StreamingPlatformData[] => {
  return services.map(service => {
    // Skip if service doesn't have a name
    if (!service.service) {
      return service;
    }
    
    // Normalize the service name for URL creation
    const normalizedServiceName = service.service.toLowerCase()
      .replace(/\+/g, 'plus')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/max/i, 'hbomax');
    
    // Create a default link if one doesn't exist
    if (!service.link) {
      const baseUrl = getServiceBaseUrl(normalizedServiceName);
      service.link = baseUrl;
    }
    
    // Add a logo URL if one doesn't exist
    if (!service.logo) {
      service.logo = `/streaming-icons/${getServiceLogoName(normalizedServiceName)}.svg`;
    }
    
    return service;
  });
};

// Get the base URL for a streaming service
function getServiceBaseUrl(serviceName: string): string {
  const serviceMap: Record<string, string> = {
    'netflix': 'https://www.netflix.com',
    'amazonprime': 'https://www.amazon.com/Prime-Video',
    'prime': 'https://www.amazon.com/Prime-Video',
    'hulu': 'https://www.hulu.com',
    'disneyplus': 'https://www.disneyplus.com',
    'disney': 'https://www.disneyplus.com',
    'hbomax': 'https://www.max.com',
    'max': 'https://www.max.com',
    'appletv': 'https://tv.apple.com',
    'apple': 'https://tv.apple.com',
    'paramountplus': 'https://www.paramountplus.com',
    'paramount': 'https://www.paramountplus.com',
    'peacock': 'https://www.peacocktv.com',
    'showtime': 'https://www.showtime.com',
    'starz': 'https://www.starz.com',
    'crunchyroll': 'https://www.crunchyroll.com',
    'britbox': 'https://www.britbox.com',
    // Add more mappings as needed
  };
  
  return serviceMap[serviceName] || `https://www.${serviceName}.com`;
}

// Get the logo file name for a streaming service
function getServiceLogoName(serviceName: string): string {
  const logoMap: Record<string, string> = {
    'netflix': 'netflix',
    'amazonprime': 'amazon',
    'prime': 'prime',
    'hulu': 'hulu',
    'disneyplus': 'disneyplus',
    'disney': 'disney',
    'hbomax': 'hbomax',
    'max': 'max',
    'appletv': 'appletv',
    'apple': 'apple',
    'paramountplus': 'paramount',
    'paramount': 'paramount'
    // Add more mappings as needed
  };
  
  return logoMap[serviceName] || 'default';
}
