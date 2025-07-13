
import axios from 'axios';
import type { StreamingPlatformData } from "@/types/streaming";

// The API key is securely accessed from environment variables
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

/**
 * Fetches streaming availability information using the Utelly API
 * 
 * @param title Movie title
 * @param country Country code (e.g., 'us', 'uk', 'pl')
 * @returns Array of streaming platforms where the movie is available
 */
export async function getUtellyStreamingAvailability(
  title: string,
  country: string = 'pl'
): Promise<StreamingPlatformData[]> {
  try {
    console.log(`[utelly] Fetching streaming availability for "${title}" in ${country}`);
    
    // Map country code to what Utelly supports
    const utellyCountry = mapCountryToUtellySupported(country);
    
    const options = {
      method: 'GET',
      url: 'https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/lookup',
      params: {
        term: title,
        country: utellyCountry
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    if (!response.data || !response.data.results || !Array.isArray(response.data.results)) {
      console.log('[utelly] No results found or invalid response structure');
      return [];
    }
    
    // Find the best matching result (first result is usually the most relevant)
    const matchingResult = response.data.results[0];
    
    if (!matchingResult || !Array.isArray(matchingResult.locations)) {
      console.log('[utelly] No matching result or locations found');
      return [];
    }
    
    console.log(`[utelly] Found ${matchingResult.locations.length} streaming locations for "${title}"`);
    
    // Convert Utelly format to our StreamingPlatformData format
    const streamingServices: StreamingPlatformData[] = matchingResult.locations.map(location => ({
      service: mapUtellyServiceName(location.display_name),
      available: true,
      link: location.url || '',
      logo: location.icon || getLogoForService(location.display_name),
      type: 'subscription',
      source: 'utelly'
    }));
    
    return streamingServices;
  } catch (error) {
    console.error('[utelly] Error fetching streaming availability:', error);
    return [];
  }
}

/**
 * Maps a country code to a country supported by Utelly API
 */
function mapCountryToUtellySupported(country: string): string {
  // Utelly mainly supports us, uk, ca
  const supportedCountries: Record<string, string> = {
    'pl': 'uk', // Fallback to UK for Poland
    'us': 'us',
    'uk': 'uk',
    'ca': 'ca',
    'gb': 'uk',
    'en': 'uk',
    'fr': 'uk',
    'de': 'uk',
    'it': 'uk',
    'es': 'uk'
  };
  
  return supportedCountries[country.toLowerCase()] || 'us';
}

/**
 * Standardizes service names from Utelly to our format
 */
function mapUtellyServiceName(utellyName: string): string {
  const serviceMap: Record<string, string> = {
    'Netflix': 'Netflix',
    'Amazon Prime': 'Amazon Prime Video',
    'Amazon Prime Video': 'Amazon Prime Video',
    'Amazon Instant Video': 'Amazon Prime Video',
    'Disney+': 'Disney+',
    'Disney Plus': 'Disney+',
    'HBO Max': 'HBO Max',
    'HBO GO': 'HBO Max',
    'Apple TV+': 'Apple TV+',
    'Apple TV Plus': 'Apple TV+',
    'Hulu': 'Hulu',
    'Canal+': 'Canal+',
    'Player': 'Player',
    'SkyShowtime': 'SkyShowtime'
  };
  
  return serviceMap[utellyName] || utellyName;
}

/**
 * Gets the logo path for a streaming service
 */
function getLogoForService(serviceName: string): string {
  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '');
  
  const logoMap: Record<string, string> = {
    'netflix': '/streaming-icons/netflix.svg',
    'amazonprime': '/streaming-icons/prime.svg',
    'amazonprimevideo': '/streaming-icons/prime.svg',
    'disney+': '/streaming-icons/disney.svg',
    'disneyplus': '/streaming-icons/disneyplus.svg',
    'hbomax': '/streaming-icons/hbomax.svg',
    'hbogo': '/streaming-icons/hbomax.svg',
    'appletv+': '/streaming-icons/appletv.svg',
    'appletvplus': '/streaming-icons/appletv.svg',
    'hulu': '/streaming-icons/hulu.svg',
    'canal+': '/streaming-icons/default.svg',
    'canalplus': '/streaming-icons/default.svg',
    'player': '/streaming-icons/default.svg',
    'skyshowtime': '/streaming-icons/default.svg'
  };
  
  return logoMap[normalizedName] || '/streaming-icons/default.svg';
}
