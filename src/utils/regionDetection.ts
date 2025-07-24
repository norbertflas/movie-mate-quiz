/**
 * Detect user's region/country for streaming availability
 */

export const languageToRegion: Record<string, string> = {
  'en': 'US',
  'pl': 'PL', 
  'de': 'DE',
  'fr': 'FR',
  'es': 'ES',
  'it': 'IT',
  'nl': 'NL',
  'sv': 'SE',
  'no': 'NO',
  'da': 'DK',
  'fi': 'FI',
  'pt': 'PT',
  'ru': 'RU',
  'ja': 'JP',
  'ko': 'KR',
  'zh': 'CN'
};

export const supportedRegions = [
  'US', 'PL', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 
  'PT', 'RU', 'JP', 'KR', 'CN', 'GB', 'CA', 'AU', 'BR', 'MX', 'IN'
];

/**
 * Get user's region based on multiple detection methods
 */
export async function getUserRegion(): Promise<string> {
  // Try browser language first
  const browserLanguage = navigator.language.split('-')[0];
  let region = languageToRegion[browserLanguage] || 'US';

  try {
    // Try to get more precise region from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('Europe/Warsaw')) region = 'PL';
    else if (timezone.includes('Europe/Berlin')) region = 'DE';
    else if (timezone.includes('Europe/Paris')) region = 'FR';
    else if (timezone.includes('Europe/Madrid')) region = 'ES';
    else if (timezone.includes('Europe/Rome')) region = 'IT';
    else if (timezone.includes('Europe/Amsterdam')) region = 'NL';
    else if (timezone.includes('Europe/Stockholm')) region = 'SE';
    else if (timezone.includes('Europe/Oslo')) region = 'NO';
    else if (timezone.includes('Europe/Copenhagen')) region = 'DK';
    else if (timezone.includes('Europe/Helsinki')) region = 'FI';
    else if (timezone.includes('Europe/London')) region = 'GB';
    else if (timezone.includes('America/')) {
      if (timezone.includes('Toronto') || timezone.includes('Vancouver')) region = 'CA';
      else if (timezone.includes('Sao_Paulo')) region = 'BR';
      else if (timezone.includes('Mexico')) region = 'MX';
      else region = 'US';
    }
    else if (timezone.includes('Asia/Tokyo')) region = 'JP';
    else if (timezone.includes('Asia/Seoul')) region = 'KR';
    else if (timezone.includes('Asia/Shanghai')) region = 'CN';
    else if (timezone.includes('Asia/Kolkata')) region = 'IN';
    else if (timezone.includes('Australia/')) region = 'AU';

  } catch (error) {
    console.warn('Could not detect timezone:', error);
  }

  // Fallback to stored preference
  try {
    const stored = localStorage.getItem('user-region');
    if (stored && supportedRegions.includes(stored)) {
      region = stored;
    }
  } catch (error) {
    console.warn('Could not access localStorage:', error);
  }

  console.log(`Detected user region: ${region}`);
  return region;
}

/**
 * Set and store user's preferred region
 */
export function setUserRegion(region: string): void {
  if (supportedRegions.includes(region)) {
    try {
      localStorage.setItem('user-region', region);
      console.log(`User region set to: ${region}`);
    } catch (error) {
      console.warn('Could not save region to localStorage:', error);
    }
  }
}

/**
 * Get region name for display
 */
export function getRegionName(regionCode: string): string {
  const regionNames: Record<string, string> = {
    'US': 'United States',
    'PL': 'Poland',
    'DE': 'Germany', 
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'PT': 'Portugal',
    'RU': 'Russia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India'
  };
  
  return regionNames[regionCode] || regionCode;
}