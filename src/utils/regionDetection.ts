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
 * Synchronous region detection. Priority:
 * 1. Stored user preference (explicit manual choice always wins)
 * 2. Cloudflare edge country (the user's real location, cached at startup)
 * 3. Locale country part (e.g. "pl-PL" -> PL)
 * 4. Timezone heuristic
 * 5. Browser language
 */
export function detectUserRegion(): string {
  // 1. Stored manual preference
  try {
    const stored = localStorage.getItem('user-region');
    if (stored && supportedRegions.includes(stored.toUpperCase())) {
      return stored.toUpperCase();
    }
  } catch (error) {
    console.warn('Could not access localStorage:', error);
  }

  // 2. Cloudflare edge country (cached by the startup geo bootstrap).
  // Accept any ISO-3166 alpha-2 — TMDB watch providers covers far more
  // countries than the app's UI region list.
  try {
    const cf = localStorage.getItem('cf-region');
    if (cf && /^[A-Z]{2}$/.test(cf.toUpperCase())) {
      return cf.toUpperCase();
    }
  } catch {
    /* ignore */
  }

  // 3. Locale country part
  const locale = navigator.language || 'en-US';
  const localeParts = locale.split('-');
  if (localeParts.length >= 2) {
    const localeCountry = localeParts[1].toUpperCase();
    if (supportedRegions.includes(localeCountry)) {
      return localeCountry;
    }
  }

  const browserLanguage = localeParts[0].toLowerCase();
  let region = languageToRegion[browserLanguage] || 'US';

  // 3. Timezone heuristic (refines the language-based guess)
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

  return region;
}

/**
 * Async wrapper kept for backwards compatibility with existing callers.
 */
export async function getUserRegion(): Promise<string> {
  return detectUserRegion();
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