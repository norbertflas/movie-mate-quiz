
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData } from "@/types/streaming";

/**
 * Maps service names to standard canonical names
 */
export function normalizeServiceName(serviceName: string): string {
  const normalizeMap: Record<string, string> = {
    // Netflix
    'netflix': 'Netflix',
    
    // Amazon
    'amazon': 'Amazon Prime',
    'amazonprime': 'Amazon Prime',
    'amazon prime': 'Amazon Prime',
    'prime': 'Amazon Prime',
    'primevideo': 'Amazon Prime',
    
    // Apple
    'apple': 'Apple TV+',
    'apple tv': 'Apple TV+',
    'appletv': 'Apple TV+',
    'appletv+': 'Apple TV+',
    'apple tv+': 'Apple TV+',
    
    // Disney
    'disney': 'Disney+',
    'disney+': 'Disney+',
    'disneyplus': 'Disney+',
    
    // HBO
    'hbo': 'Max',
    'hbomax': 'Max',
    'hbo max': 'Max',
    'max': 'Max',
    
    // Hulu
    'hulu': 'Hulu',
    
    // Paramount
    'paramount': 'Paramount+',
    'paramount+': 'Paramount+',
    'paramountplus': 'Paramount+',
    
    // Other services
    'peacock': 'Peacock',
    'showtime': 'Showtime',
    'starz': 'Starz',
    'canalplus': 'Canal+',
    'canal+': 'Canal+',
    'mubi': 'MUBI',
    'play': 'Play',
    'google': 'Google Play',
    'youtube': 'YouTube',
  };

  const key = serviceName.toLowerCase().trim();
  return normalizeMap[key] || serviceName;
}

/**
 * Gets the appropriate icon for a streaming service
 */
export function getServiceIconPath(serviceName: string): string {
  const iconMap: Record<string, string> = {
    'netflix': '/streaming-icons/netflix.svg',
    'amazon prime': '/streaming-icons/prime.svg',
    'prime': '/streaming-icons/prime.svg',
    'amazon': '/streaming-icons/prime.svg',
    'disney+': '/streaming-icons/disney.svg',
    'disneyplus': '/streaming-icons/disney.svg',
    'disney': '/streaming-icons/disney.svg',
    'max': '/streaming-icons/max.svg',
    'hbo max': '/streaming-icons/max.svg',
    'hbo': '/streaming-icons/max.svg',
    'hbomax': '/streaming-icons/max.svg',
    'hulu': '/streaming-icons/hulu.svg',
    'apple tv+': '/streaming-icons/apple.svg',
    'apple': '/streaming-icons/apple.svg',
    'appletv': '/streaming-icons/apple.svg',
    'appletv+': '/streaming-icons/apple.svg',
    'paramount+': '/streaming-icons/paramount.svg',
    'paramount': '/streaming-icons/paramount.svg',
    'paramountplus': '/streaming-icons/paramount.svg',
    'peacock': '/streaming-icons/default.svg',
    'showtime': '/streaming-icons/default.svg',
    'starz': '/streaming-icons/default.svg',
    'mubi': '/streaming-icons/default.svg',
    'play': '/streaming-icons/default.svg',
    'canal+': '/streaming-icons/default.svg',
    'canalplus': '/streaming-icons/default.svg',
    'google': '/streaming-icons/default.svg',
    'youtube': '/streaming-icons/default.svg',
  };

  const key = serviceName.toLowerCase().trim();
  return iconMap[key] || '/streaming-icons/default.svg';
}

/**
 * Movie-specific direct links for popular movies
 * This helps ensure we link directly to the content when possible
 */
export const knownMovieLinks: Record<string, Record<string, string>> = {
  // Movie ID: { service: direct link }
  '348': { // Alien (1979)
    'hulu': 'https://www.hulu.com/movie/alien-27389b6b-bf27-45a6-afdf-cef0fe723cff',
    'disney': 'https://www.disneyplus.com/movies/alien/4IcBqr9hAPDJ',
    'prime': 'https://www.amazon.com/Alien-Sigourney-Weaver/dp/B001GJ7OT8',
    'apple': 'https://tv.apple.com/us/movie/alien/umc.cmc.53br8g12tjkru519sz48vkjqa'
  }
};

/**
 * Builds a valid streaming service URL based on service name
 * Now with improved handling for different services and direct content linking
 */
export function buildServiceUrl(serviceName: string, tmdbId?: number, movieTitle?: string): string {
  const normalizedName = serviceName.toLowerCase().trim();
  
  // Check if we have a known direct link for this movie
  if (tmdbId && knownMovieLinks[String(tmdbId)] && knownMovieLinks[String(tmdbId)][normalizedName]) {
    return knownMovieLinks[String(tmdbId)][normalizedName];
  }
  
  // Map for special domain formats
  const domainMap: Record<string, string> = {
    'netflix': 'netflix.com',
    'prime': 'primevideo.com',
    'amazon': 'primevideo.com',
    'amazon prime': 'primevideo.com',
    'amazonprime': 'primevideo.com',
    'disney': 'disneyplus.com',
    'disney+': 'disneyplus.com',
    'disneyplus': 'disneyplus.com',
    'hbo': 'max.com',
    'hbomax': 'max.com',
    'max': 'max.com',
    'apple': 'tv.apple.com',
    'appletv': 'tv.apple.com',
    'apple tv+': 'tv.apple.com',
    'apple tv': 'tv.apple.com',
    'paramount+': 'paramountplus.com',
    'paramount': 'paramountplus.com',
    'paramountplus': 'paramountplus.com',
    'hulu': 'hulu.com',
    'peacock': 'peacocktv.com',
    'canal+': 'canalplus.com',
    'canalplus': 'canalplus.com',
    'mubi': 'mubi.com',
    'play': 'play.pl',
    'google': 'play.google.com/store/movies',
    'youtube': 'youtube.com'
  };
  
  const domain = domainMap[normalizedName] || `${normalizedName.replace(/\+/g, 'plus').replace(/\s+/g, '')}.com`;
  
  // Special path formats for some services
  let path = '';
  if (tmdbId && tmdbId > 0) {
    if (normalizedName.includes('netflix')) {
      path = `/title/${tmdbId}`;
    } else if (normalizedName.includes('prime') || normalizedName.includes('amazon')) {
      path = `/detail/${tmdbId}`;
    } else if (normalizedName.includes('disney')) {
      path = `/movie/${tmdbId}`;
    } else if (normalizedName.includes('apple')) {
      path = `/movie/movie-${tmdbId}`;
    } else if (normalizedName.includes('hulu')) {
      path = movieTitle ? `/movie/${encodeURIComponent(movieTitle.toLowerCase().replace(/\s+/g, '-'))}` : '/hub/movies';
    } else {
      path = movieTitle ? `/movie/${encodeURIComponent(movieTitle.toLowerCase().replace(/\s+/g, '-'))}` : `/movie/${tmdbId}`;
    }
  } else {
    // Default paths for home pages
    const servicePaths: Record<string, string> = {
      'netflix': '/browse',
      'prime': '/storefront',
      'amazon': '/storefront',
      'disney': '/home',
      'hulu': '/hub/movies',
      'hbo': '/movies',
      'max': '/movies',
      'apple': '/us/movies',
      'paramount': '/movies',
    };
    
    path = servicePaths[normalizedName] || '';
  }
  
  return `https://${domain}${path}`;
}

/**
 * Format service links to make sure they're usable
 */
export function formatServiceLinks(services: StreamingPlatformData[]): StreamingPlatformData[] {
  if (!services || !Array.isArray(services)) return [];
  
  return services.map(service => {
    // Skip if no service name
    if (!service || !service.service) return null;
    
    // Normalize service name
    const normalizedName = normalizeServiceName(service.service);
    
    // Generate appropriate logo path
    const logoPath = service.logo || getServiceIconPath(service.service);
    
    // Check if we have a directLink from the API (preferred)
    let link = service.directLink || service.link;
    
    // If we don't have a valid link, build one
    if (!link || link === '' || link === 'https://') {
      link = buildServiceUrl(service.service, service.tmdbId, service.title);
    }
    
    // Ensure links have protocol
    if (link && !link.startsWith('http')) {
      link = `https://${link}`;
    }
    
    return {
      ...service,
      service: normalizedName,
      available: true,
      link,
      logo: logoPath
    };
  }).filter(Boolean) as StreamingPlatformData[];
}

/**
 * Returns the streaming type (subscription, rent, etc) in friendly format
 */
export function getStreamingTypeDisplay(type: string | undefined): string {
  if (!type) return 'Subscription';
  
  switch(type.toLowerCase()) {
    case 'subscription': 
    case 'sub': 
    case 'flatrate':
      return 'Subscription';
    case 'free':
      return 'Free';
    case 'ads':
      return 'Free with ads';
    case 'rent':
    case 'tvod':
      return 'Rent/Buy';
    case 'buy':
      return 'Buy';
    case 'addon':
      return 'Add-on package';
    default:
      return type;
  }
}

/**
 * Get streaming services by region from Supabase
 */
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

/**
 * Map languages to region codes
 */
export const languageToRegion: { [key: string]: string } = {
  pl: 'pl',
  en: 'us',
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
  // Add other language mappings as needed
};
