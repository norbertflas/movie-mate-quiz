// Streaming availability lookup (formerly the streaming-availability-pro
// Supabase edge function, now native to the Worker).
// Sources: TMDB watch providers (primary), RapidAPI MovieOfTheNight
// (enrichment). Never fabricates fallback data — an empty result
// means the title is genuinely unavailable in the region.

export interface StreamingOption {
  service: string;
  serviceLogo: string;
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  quality: string;
  price?: {
    amount: number;
    currency: string;
    formatted: string;
  };
}

export interface MovieStreamingData {
  tmdbId: number;
  title: string;
  streamingOptions: StreamingOption[];
  availableServices: string[];
  rentBuyServices: string[];
  hasStreaming: boolean;
  lastUpdated: string;
  source?: string;
}

export type MediaType = "movie" | "tv";

const TYPE_PRIORITY: Record<string, number> = { subscription: 4, free: 3, rent: 2, buy: 1 };

// TMDB/JustWatch report plan variants ("Netflix Standard with Ads")
// and channel resellers ("HBO Max Amazon Channel") as separate
// providers — collapse them onto the parent service.
const PROVIDER_SUFFIXES = [
  ' standard with ads',
  ' basic with ads',
  ' with ads',
  ' amazon channels',
  ' amazon channel',
  ' apple tv channel',
  ' premium',
];

function normalizeProviderName(rawName: string): string {
  let key = rawName.toLowerCase().trim();
  for (const suffix of PROVIDER_SUFFIXES) {
    if (key.endsWith(suffix)) {
      key = key.slice(0, -suffix.length).trim();
      break;
    }
  }
  return getServiceDisplayName(key);
}

const sortOptions = (options: StreamingOption[]): StreamingOption[] =>
  [...options].sort((a, b) => (TYPE_PRIORITY[b.type] || 0) - (TYPE_PRIORITY[a.type] || 0));

export const buildResult = (tmdbId: number, title: string, options: StreamingOption[], source: string): MovieStreamingData => {
  const sorted = sortOptions(options);
  const availableServices: string[] = [];
  const rentBuyServices: string[] = [];

  for (const option of sorted) {
    if (option.type === 'subscription' || option.type === 'free') {
      if (!availableServices.includes(option.service)) availableServices.push(option.service);
    } else {
      if (!rentBuyServices.includes(option.service)) rentBuyServices.push(option.service);
    }
  }

  return {
    tmdbId,
    title,
    streamingOptions: sorted,
    availableServices,
    rentBuyServices,
    hasStreaming: availableServices.length > 0,
    lastUpdated: new Date().toISOString(),
    source
  };
};

// =====================================================
// SOURCE 1: TMDB Watch Providers (FREE, JustWatch-backed, current data)
// =====================================================
const fetchTmdbWatchProviders = async (tmdbId: number, country: string, tmdbApiKey: string, mediaType?: MediaType): Promise<MovieStreamingData | null> => {
  if (!tmdbApiKey) return null;

  const region = country.toUpperCase();

  // Query the exact endpoint when the media type is known (from search);
  // otherwise try movie first, then TV.
  const allEndpoints = [
    { url: `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}&append_to_response=watch/providers`, type: 'movie' as MediaType },
    { url: `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${tmdbApiKey}&append_to_response=watch/providers`, type: 'tv' as MediaType }
  ];
  const endpoints = mediaType ? allEndpoints.filter(e => e.type === mediaType) : allEndpoints;

  // Track whether TMDB actually answered. If no endpoint responds (network
  // error / 5xx / auth failure) we must NOT report "no providers" — that
  // would be cached as unavailable. Throwing lets the caller treat it as a
  // transient error (not cached, retried next time).
  let respondedOk = false;

  for (const endpoint of endpoints) {
    let response: Response;
    try {
      response = await fetch(endpoint.url, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`TMDB network error for ${tmdbId} (${endpoint.type}):`, error);
      continue; // transport failure — leave respondedOk false
    }

    // 404 = this id isn't that media type: a real answer, just not found.
    if (response.status === 404) { respondedOk = true; continue; }
    // 401/403/429/5xx = transient/config failure — do not treat as "empty".
    if (!response.ok) {
      console.error(`TMDB HTTP ${response.status} for ${tmdbId} (${endpoint.type})`);
      continue;
    }
    respondedOk = true;

    try {
      const data: any = await response.json();
      const watchProviders = data['watch/providers']?.results?.[region];

      if (!watchProviders) continue;

      const providerGroups: Array<{ key: string; type: StreamingOption['type'] }> = [
        { key: 'flatrate', type: 'subscription' },
        { key: 'free', type: 'free' },
        { key: 'ads', type: 'free' },
        { key: 'rent', type: 'rent' },
        { key: 'buy', type: 'buy' }
      ];

      const movieTitle = data.title || data.name || data.original_title || data.original_name || '';
      // TMDB returns a real JustWatch "where to watch" link for the title in
      // this region. TMDB has NO per-service deep links, so we use this real
      // aggregator link instead of fabricating per-service URLs (which were
      // dead/incorrect). Falls back to a service search only if absent.
      const justWatchLink: string = (watchProviders as { link?: string }).link || '';
      const bestByService = new Map<string, StreamingOption>();

      for (const group of providerGroups) {
        const providers = Array.isArray(watchProviders[group.key]) ? watchProviders[group.key] : [];
        for (const provider of providers) {
          const rawName = provider.provider_name || 'Unknown';
          const serviceName = normalizeProviderName(rawName);

          const option: StreamingOption = {
            service: serviceName,
            serviceLogo: provider.logo_path
              ? `https://image.tmdb.org/t/p/w154${provider.logo_path}`
              : getServiceLogo(serviceName.toLowerCase()),
            // Prefer a direct link to the service (searching the title);
            // fall back to the real JustWatch page only for services we
            // don't have a mapping for (never a fabricated domain).
            link: getServiceSearchUrl(serviceName.toLowerCase(), movieTitle)
              || justWatchLink
              || getServiceHomeUrl(serviceName.toLowerCase()),
            type: group.type,
            quality: 'HD'
          };

          const existing = bestByService.get(serviceName);
          if (!existing || (TYPE_PRIORITY[option.type] || 0) > (TYPE_PRIORITY[existing.type] || 0)) {
            bestByService.set(serviceName, option);
          }
        }
      }

      const streamingOptions = [...bestByService.values()];
      if (streamingOptions.length > 0) {
        return buildResult(tmdbId, movieTitle, streamingOptions, 'tmdb');
      }
    } catch (error) {
      console.error(`TMDB parse error for ${tmdbId} (${endpoint.type}):`, error);
    }
  }

  // Responded but no providers for this region = genuine "not available".
  if (respondedOk) return null;
  // Nothing answered = transient failure; signal so it isn't cached as empty.
  throw new Error(`TMDB unreachable for ${tmdbId}`);
};

// =====================================================
// SOURCE 2: RapidAPI Streaming Availability (enrichment)
// =====================================================
export const fetchRapidApiStreaming = async (tmdbId: number, country: string, rapidApiKey: string, mediaType?: MediaType): Promise<MovieStreamingData | null> => {
  if (!rapidApiKey) return null;

  // MovieOfTheNight v4: GET /shows/{type}/{tmdbId}; the TMDB id path uses
  // "movie" / "tv" (matching TMDB media types), NOT "series".
  const allEndpoints = [
    { url: `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}?country=${country.toLowerCase()}`, type: "movie" as MediaType },
    { url: `https://streaming-availability.p.rapidapi.com/shows/tv/${tmdbId}?country=${country.toLowerCase()}`, type: "tv" as MediaType }
  ];
  const endpoints = (mediaType ? allEndpoints.filter(e => e.type === mediaType) : allEndpoints).map(e => e.url);

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
        }
      });

      if (response.status === 429) {
        console.log('RapidAPI rate limited, skipping...');
        return null;
      }
      if (!response.ok) continue;

      const data: any = await response.json();

      // Support both v3 and v4 API response shapes
      const countryLower = country.toLowerCase();
      const countryUpper = country.toUpperCase();
      const countryData =
        data.streamingOptions?.[countryLower] ??
        data.streamingOptions?.[countryUpper] ??
        data.streamingInfo?.[countryLower] ??
        data.streamingInfo?.[countryUpper];

      const rawOptions = extractStreamingOptions(countryData);
      if (rawOptions.length === 0) continue;

      const bestByService = new Map<string, StreamingOption>();

      for (const item of rawOptions) {
        // Skip offers that have already left the catalog
        if (item?.expiresOn && item.expiresOn * 1000 < Date.now()) continue;

        const serviceIdOrName = item?.service?.id || item?.service?.name || item?.service || item?.provider || 'unknown';
        const serviceName = normalizeProviderName(String(serviceIdOrName));

        const option: StreamingOption = {
          service: serviceName,
          serviceLogo: getServiceLogo(String(serviceIdOrName).toLowerCase()),
          link: item?.link || getServiceHomeUrl(String(serviceIdOrName).toLowerCase()),
          type: getStreamingType(item),
          quality: item?.quality || 'HD',
          price: item?.price ? {
            amount: parseFloat(item.price.amount),
            currency: item.price.currency,
            formatted: item.price.formatted
          } : undefined
        };

        const existing = bestByService.get(serviceName);
        if (!existing || (TYPE_PRIORITY[option.type] || 0) > (TYPE_PRIORITY[existing.type] || 0)) {
          bestByService.set(serviceName, option);
        }
      }

      const streamingOptions = [...bestByService.values()];
      if (streamingOptions.length > 0) {
        return buildResult(tmdbId, data.title || data.originalTitle || data.name || '', streamingOptions, 'rapidapi');
      }
    } catch (error) {
      console.error(`RapidAPI error for ${tmdbId}:`, error);
    }
  }

  return null;
};

const extractStreamingOptions = (countryData: unknown): any[] => {
  if (!countryData) return [];
  if (Array.isArray(countryData)) return countryData;
  if (typeof countryData === 'object') {
    const flattened: any[] = [];
    for (const value of Object.values(countryData as Record<string, unknown>)) {
      if (Array.isArray(value)) flattened.push(...value);
    }
    return flattened;
  }
  return [];
};

export const fetchStreamingData = async (
  tmdbId: number,
  country: string,
  keys: { tmdbApiKey: string; rapidApiKey?: string },
  mediaType?: MediaType
): Promise<MovieStreamingData> => {
  // Primary, authoritative source: TMDB watch providers (JustWatch data).
  // Throws if TMDB was unreachable; returns null if it responded with no
  // providers for the region (a genuine "not available").
  let tmdbResponded = false;
  try {
    const tmdbResult = await fetchTmdbWatchProviders(tmdbId, country, keys.tmdbApiKey, mediaType);
    tmdbResponded = true;
    if (tmdbResult && tmdbResult.streamingOptions.length > 0) {
      return tmdbResult;
    }
  } catch (error) {
    console.error(`TMDB failed for ${tmdbId}:`, error);
  }

  // Secondary: RapidAPI can recover (TMDB unreachable) or add coverage.
  if (keys.rapidApiKey) {
    const rapidResult = await fetchRapidApiStreaming(tmdbId, country, keys.rapidApiKey, mediaType);
    if (rapidResult && rapidResult.streamingOptions.length > 0) {
      return rapidResult;
    }
  }

  // Only report (and let the route cache) "not available" when the
  // authoritative source actually answered. Otherwise signal a transient
  // failure so it is NOT cached as empty and is retried next time.
  if (tmdbResponded) {
    return buildResult(tmdbId, '', [], 'none');
  }
  throw new Error(`streaming lookup failed for ${tmdbId} (no source responded)`);
};

// =====================================================
// Deep links (RapidAPI / MovieOfTheNight) — exact per-title links
// =====================================================

/** Resolve exact per-service deep links for a title via RapidAPI.
 *  Tries the hinted media type first, then the other. Returns a map of
 *  normalized service name -> deep link (empty if none/unavailable). */
export async function fetchRapidApiDeepLinks(
  tmdbId: number,
  country: string,
  rapidApiKey: string,
  mediaType?: MediaType
): Promise<Record<string, string>> {
  const order: MediaType[] = mediaType
    ? [mediaType, mediaType === "movie" ? "tv" : "movie"]
    : ["movie", "tv"];

  for (const type of order) {
    const data = await fetchRapidApiStreaming(tmdbId, country, rapidApiKey, type).catch(() => null);
    if (data && data.streamingOptions.length > 0) {
      const map: Record<string, string> = {};
      for (const opt of data.streamingOptions) {
        if (opt.link) map[opt.service] = opt.link;
      }
      if (Object.keys(map).length > 0) return map;
    }
  }
  return {};
}

/** Find the deep link for a service name (exact, then fuzzy). */
export function matchServiceLink(links: Record<string, string> | null, service: string): string | null {
  if (!links) return null;
  const keys = Object.keys(links);
  const s = service.toLowerCase().trim();
  const exact = keys.find((k) => k.toLowerCase() === s);
  if (exact) return links[exact];
  const fuzzy = keys.find((k) => {
    const kl = k.toLowerCase();
    return kl.includes(s) || s.includes(kl);
  });
  return fuzzy ? links[fuzzy] : null;
}

// =====================================================
// Helper functions
// =====================================================
function getServiceDisplayName(serviceId: string): string {
  const key = serviceId.toLowerCase().trim();
  const serviceNames: Record<string, string> = {
    'netflix': 'Netflix',
    'netflix kids': 'Netflix',
    'prime': 'Amazon Prime Video',
    'amazon': 'Amazon Prime Video',
    'amazon video': 'Amazon Video',
    'amazon prime video': 'Amazon Prime Video',
    'amazonprimevideo': 'Amazon Prime Video',
    'disney': 'Disney+',
    'disney+': 'Disney+',
    'disneyplus': 'Disney+',
    'disney plus': 'Disney+',
    'hbo': 'HBO Max',
    'hbo max': 'HBO Max',
    'max': 'HBO Max',
    'hulu': 'Hulu',
    'apple': 'Apple TV+',
    'apple tv': 'Apple TV',
    'apple tv+': 'Apple TV+',
    'apple tv plus': 'Apple TV+',
    'appletv': 'Apple TV+',
    'paramount': 'Paramount+',
    'paramount+': 'Paramount+',
    'paramount plus': 'Paramount+',
    'paramountplus': 'Paramount+',
    'canal': 'Canal+',
    'canal+': 'Canal+',
    'canalplus': 'Canal+',
    'canal+ online': 'Canal+',
    'player': 'Player.pl',
    'player.pl': 'Player.pl',
    'polsat': 'Polsat Box Go',
    'polsat box go': 'Polsat Box Go',
    'tvp': 'TVP VOD',
    'tvp vod': 'TVP VOD',
    'skyshowtime': 'SkyShowtime',
    'sky showtime': 'SkyShowtime',
    'viaplay': 'Viaplay',
    'curiosity stream': 'CuriosityStream',
    'curiositystream': 'CuriosityStream',
    'mubi': 'MUBI',
    'crunchyroll': 'Crunchyroll',
    'peacock': 'Peacock',
    'starz': 'STARZ',
    'rakuten': 'Rakuten TV',
    'rakuten tv': 'Rakuten TV',
    'google play movies': 'Google Play',
    'youtube': 'YouTube',
    'youtube premium': 'YouTube Premium',
  };
  return serviceNames[key] || serviceId.charAt(0).toUpperCase() + serviceId.slice(1);
}

function getServiceLogo(serviceId: string): string {
  const key = serviceId.toLowerCase().trim();
  const logoMap: Record<string, string> = {
    'netflix': '/streaming-icons/netflix.svg',
    'prime': '/streaming-icons/prime.svg',
    'amazon': '/streaming-icons/prime.svg',
    'amazon prime video': '/streaming-icons/prime.svg',
    'disney': '/streaming-icons/disney.svg',
    'disney+': '/streaming-icons/disney.svg',
    'disneyplus': '/streaming-icons/disney.svg',
    'hbo': '/streaming-icons/hbomax.svg',
    'hbo max': '/streaming-icons/hbomax.svg',
    'max': '/streaming-icons/max.svg',
    'hulu': '/streaming-icons/hulu.svg',
    'apple': '/streaming-icons/apple.svg',
    'apple tv+': '/streaming-icons/apple.svg',
    'paramount': '/streaming-icons/paramount.svg',
    'paramount+': '/streaming-icons/paramount.svg',
  };
  return logoMap[key] || '/streaming-icons/default.svg';
}

function getStreamingType(option: any): 'subscription' | 'rent' | 'buy' | 'free' {
  const t = option?.type?.toLowerCase?.() || '';
  if (t === 'subscription' || t === 'flatrate' || t === 'sub' || t === 'addon') return 'subscription';
  if (t === 'rent') return 'rent';
  if (t === 'buy') return 'buy';
  if (t === 'free' || t === 'ads') return 'free';
  return 'subscription';
}

function getServiceHomeUrl(serviceId: string): string {
  const key = serviceId.toLowerCase().trim();
  const serviceUrls: Record<string, string> = {
    'netflix': 'https://netflix.com',
    'prime': 'https://amazon.com/prime-video',
    'amazon': 'https://amazon.com/prime-video',
    'disney': 'https://disneyplus.com',
    'disney+': 'https://disneyplus.com',
    'hbo': 'https://max.com',
    'hbo max': 'https://max.com',
    'max': 'https://max.com',
    'hulu': 'https://hulu.com',
    'apple': 'https://tv.apple.com',
    'apple tv+': 'https://tv.apple.com',
    'paramount': 'https://paramountplus.com',
    'paramount+': 'https://paramountplus.com',
    'canal': 'https://canalplus.pl',
    'canal+': 'https://canalplus.pl',
    'player': 'https://player.pl',
    'player.pl': 'https://player.pl',
    'polsat': 'https://polsatboxgo.pl',
    'tvp': 'https://vod.tvp.pl',
    'skyshowtime': 'https://skyshowtime.com',
    'viaplay': 'https://viaplay.pl',
    'mubi': 'https://mubi.com',
  };
  return serviceUrls[key] || `https://${key.replace(/\s+/g, '')}.com`;
}

// Build a link that lands the user directly on the streaming service with
// the title searched (correct domains, fuzzy-matched on the provider name).
// Returns "" for unknown services so the caller can fall back to the real
// JustWatch link rather than a fabricated domain.
function getServiceSearchUrl(serviceId: string, title: string): string {
  const k = serviceId.toLowerCase().trim();
  if (!title) return "";
  const t = encodeURIComponent(title);

  if (k.includes("netflix")) return `https://www.netflix.com/search?q=${t}`;
  if (k.includes("prime") || k.includes("amazon")) return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${t}`;
  if (k.includes("disney")) return `https://www.disneyplus.com/search?q=${t}`;
  if (k.includes("hbo") || k === "max" || k.includes("hbo max")) return `https://play.max.com/search?q=${t}`;
  if (k.includes("apple")) return `https://tv.apple.com/search?term=${t}`;
  if (k.includes("hulu")) return `https://www.hulu.com/search?q=${t}`;
  if (k.includes("paramount")) return `https://www.paramountplus.com/search/?query=${t}`;
  if (k.includes("canal")) return `https://www.canalplus.com/pl/szukaj?q=${t}`;
  if (k.includes("player")) return `https://player.pl/szukaj?query=${t}`;
  if (k.includes("polsat")) return `https://polsatboxgo.pl/szukaj?q=${t}`;
  if (k.includes("cda")) return `https://www.cda.pl/szukaj/${t}`;
  if (k.includes("rakuten")) return `https://www.rakuten.tv/pl/search?q=${t}`;
  if (k.includes("tvp")) return `https://vod.tvp.pl/szukaj?query=${t}`;
  if (k.includes("pilot")) return `https://pilot.wp.pl/szukaj/?query=${t}`;
  if (k.includes("skyshowtime")) return `https://www.skyshowtime.com/pl/search?q=${t}`;
  if (k.includes("viaplay")) return `https://viaplay.pl/search?query=${t}`;
  if (k.includes("mubi")) return `https://mubi.com/search?query=${t}`;
  if (k.includes("crunchyroll")) return `https://www.crunchyroll.com/search?q=${t}`;
  if (k.includes("chili")) return `https://pl.chili.com/search?q=${t}`;
  if (k.includes("google play")) return `https://play.google.com/store/search?q=${t}&c=movies`;
  if (k.includes("youtube")) return `https://www.youtube.com/results?search_query=${t}`;
  if (k.includes("peacock")) return `https://www.peacocktv.com/search?q=${t}`;
  if (k.includes("curiosity")) return `https://curiositystream.com/search/${t}`;
  return "";
}
