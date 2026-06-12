import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ?
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

// Server-side cache TTL: fresh data is kept for a day, empty results retried sooner
const CACHE_TTL_HOURS_DATA = 24;
const CACHE_TTL_HOURS_EMPTY = 6;

interface StreamingRequest {
  tmdbIds: number[];
  country?: string;
  mode?: 'instant' | 'lazy';
  forceRefresh?: boolean;
}

interface StreamingOption {
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

interface MovieStreamingData {
  tmdbId: number;
  title: string;
  streamingOptions: StreamingOption[];
  availableServices: string[];
  rentBuyServices: string[];
  hasStreaming: boolean;
  lastUpdated: string;
  source?: string;
}

const TYPE_PRIORITY: Record<string, number> = { subscription: 4, free: 3, rent: 2, buy: 1 };

// Rate limiting state for RapidAPI
let requestCount = 0;
let lastResetTime = Date.now();
const MAX_REQUESTS_PER_SECOND = 8;

const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastResetTime > 1000) {
    requestCount = 0;
    lastResetTime = now;
  }
  return requestCount < MAX_REQUESTS_PER_SECOND;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =====================================================
// Provider name normalization
// TMDB/JustWatch report plan variants ("Netflix Standard with Ads")
// and channel resellers ("HBO Max Amazon Channel") as separate
// providers — collapse them onto the parent service.
// =====================================================
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

const buildResult = (tmdbId: number, title: string, options: StreamingOption[], source: string): MovieStreamingData => {
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
const fetchTmdbWatchProviders = async (tmdbId: number, country: string): Promise<MovieStreamingData | null> => {
  if (!TMDB_API_KEY) return null;

  const region = country.toUpperCase();

  // Try both movie and TV endpoints
  const endpoints = [
    { url: `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`, type: 'movie' },
    { url: `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`, type: 'tv' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) continue;

      const data = await response.json();
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
      // Track best option per service so plan variants don't create duplicates
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
            // Use direct service search URL, NOT the TMDB referral link
            link: getServiceSearchUrl(serviceName.toLowerCase(), movieTitle),
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
        const result = buildResult(tmdbId, movieTitle, streamingOptions, 'tmdb');
        console.log(`✅ TMDB found ${streamingOptions.length} services for "${movieTitle}" (${tmdbId}) in ${region}: ${result.availableServices.join(', ') || '(rent/buy only)'}`);
        return result;
      }
    } catch (error) {
      console.error(`TMDB error for ${tmdbId} (${endpoint.type}):`, error);
    }
  }

  return null;
};

// =====================================================
// SOURCE 2: RapidAPI Streaming Availability (enrichment)
// =====================================================
const fetchRapidApiStreaming = async (tmdbId: number, country: string): Promise<MovieStreamingData | null> => {
  if (!RAPIDAPI_KEY) return null;

  if (!checkRateLimit()) {
    console.log('RapidAPI rate limit reached, skipping...');
    return null;
  }
  requestCount++;

  const endpoints = [
    `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}?country=${country.toLowerCase()}`,
    `https://streaming-availability.p.rapidapi.com/shows/series/${tmdbId}?country=${country.toLowerCase()}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
        }
      });

      if (response.status === 429) {
        console.log('RapidAPI rate limited, skipping...');
        return null;
      }
      if (!response.ok) continue;

      const data = await response.json();

      // Try multiple data structures (v3 and v4 API)
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
        const result = buildResult(tmdbId, data.title || data.originalTitle || data.name || '', streamingOptions, 'rapidapi');
        console.log(`✅ RapidAPI found ${streamingOptions.length} services for ${tmdbId}: ${result.availableServices.join(', ') || '(rent/buy only)'}`);
        return result;
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

// =====================================================
// COMBINED: Try TMDB first, then RapidAPI if needed.
// NEVER fabricate fallback data — an empty result means
// "not available", which is shown honestly in the UI.
// =====================================================
const fetchStreamingData = async (tmdbId: number, country: string): Promise<MovieStreamingData> => {
  // 1. Try TMDB Watch Providers first (free, reliable, good coverage)
  const tmdbResult = await fetchTmdbWatchProviders(tmdbId, country);
  if (tmdbResult && tmdbResult.streamingOptions.length > 0) {
    return tmdbResult;
  }

  // 2. Try RapidAPI Streaming Availability as enrichment
  const rapidResult = await fetchRapidApiStreaming(tmdbId, country);
  if (rapidResult && rapidResult.streamingOptions.length > 0) {
    return rapidResult;
  }

  console.log(`⚠️ No streaming data found for ${tmdbId} in ${country} from any source`);
  return buildResult(tmdbId, '', [], 'none');
};

// =====================================================
// Server-side cache (streaming_cache table, UNIQUE(tmdb_id, country))
// =====================================================
const readCache = async (tmdbIds: number[], country: string): Promise<Map<number, MovieStreamingData>> => {
  const cached = new Map<number, MovieStreamingData>();
  if (!supabase) return cached;

  try {
    const { data, error } = await supabase
      .from('streaming_cache')
      .select('tmdb_id, streaming_data')
      .in('tmdb_id', tmdbIds)
      .eq('country', country.toUpperCase())
      .gte('expires_at', new Date().toISOString());

    if (error) throw error;

    for (const row of data || []) {
      const entry = row.streaming_data as MovieStreamingData | null;
      if (entry && Array.isArray(entry.streamingOptions)) {
        cached.set(row.tmdb_id, { ...entry, source: 'cache' });
      }
    }
  } catch (error) {
    console.error('Cache read failed:', error);
  }

  return cached;
};

const writeCache = async (results: MovieStreamingData[], country: string): Promise<void> => {
  if (!supabase || results.length === 0) return;

  try {
    const now = Date.now();
    const rows = results.map(result => ({
      tmdb_id: result.tmdbId,
      country: country.toUpperCase(),
      streaming_data: result,
      source: result.source || 'api',
      cached_at: new Date(now).toISOString(),
      expires_at: new Date(now + (result.streamingOptions.length > 0 ? CACHE_TTL_HOURS_DATA : CACHE_TTL_HOURS_EMPTY) * 60 * 60 * 1000).toISOString()
    }));

    const { error } = await supabase
      .from('streaming_cache')
      .upsert(rows, { onConflict: 'tmdb_id,country' });

    if (error) throw error;
  } catch (error) {
    console.error('Cache write failed:', error);
  }
};

const processBatch = async (tmdbIds: number[], country: string): Promise<MovieStreamingData[]> => {
  const results: MovieStreamingData[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < tmdbIds.length; i += BATCH_SIZE) {
    const batch = tmdbIds.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}, movies ${i + 1}-${Math.min(i + BATCH_SIZE, tmdbIds.length)}`);

    const batchPromises = batch.map(tmdbId => fetchStreamingData(tmdbId, country));
    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Fetch failed for TMDB ID ${batch[index]}:`, result.reason);
        results.push(buildResult(batch[index], '', [], 'error'));
      }
    });

    if (i + BATCH_SIZE < tmdbIds.length) {
      await delay(100);
    }
  }

  return results;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { tmdbIds, country = 'pl', mode = 'lazy', forceRefresh = false }: StreamingRequest = await req.json();

    if (!tmdbIds || !Array.isArray(tmdbIds) || tmdbIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid tmdbIds array" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const uniqueIds = [...new Set(tmdbIds.filter(id => Number.isInteger(id) && id > 0))];

    console.log(`Processing ${uniqueIds.length} movies for country: ${country} (server cache → TMDB → RapidAPI)`);

    // 1. Server-side cache
    const cachedResults = forceRefresh
      ? new Map<number, MovieStreamingData>()
      : await readCache(uniqueIds, country);
    const missingIds = uniqueIds.filter(id => !cachedResults.has(id));

    // 2. Fetch only what's missing
    let fetchedResults: MovieStreamingData[] = [];
    if (missingIds.length > 0) {
      if (supabase) {
        await supabase.rpc('increment_api_usage', {
          p_service: 'streaming-availability-pro',
          p_date: new Date().toISOString().split('T')[0],
          p_hour: new Date().getHours(),
          p_minute: new Date().getMinutes()
        });
      }

      fetchedResults = await processBatch(missingIds, country);
      await writeCache(fetchedResults.filter(r => r.source !== 'error'), country);
    }

    const results = [...cachedResults.values(), ...fetchedResults];

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        totalProcessed: uniqueIds.length,
        totalFound: results.filter(r => r.hasStreaming).length,
        fromCache: cachedResults.size,
        mode,
        country,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in streaming-availability-pro:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

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

function getServiceSearchUrl(serviceId: string, title: string): string {
  const key = serviceId.toLowerCase().trim();
  const encoded = encodeURIComponent(title);
  if (!title) return getServiceHomeUrl(key);
  const searchUrls: Record<string, string> = {
    'netflix': `https://www.netflix.com/search?q=${encoded}`,
    'prime': `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encoded}`,
    'amazon': `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encoded}`,
    'amazon video': `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encoded}`,
    'amazon prime video': `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encoded}`,
    'disney': `https://www.disneyplus.com/search?q=${encoded}`,
    'disney+': `https://www.disneyplus.com/search?q=${encoded}`,
    'hbo max': `https://www.max.com/search?q=${encoded}`,
    'max': `https://www.max.com/search?q=${encoded}`,
    'hulu': `https://www.hulu.com/search?q=${encoded}`,
    'apple tv': `https://tv.apple.com/search?term=${encoded}`,
    'apple tv+': `https://tv.apple.com/search?term=${encoded}`,
    'paramount+': `https://www.paramountplus.com/search/${encoded}`,
    'canal+': `https://www.canalplus.com/pl/search?q=${encoded}`,
    'player.pl': `https://player.pl/szukaj?query=${encoded}`,
    'polsat box go': `https://polsatboxgo.pl/szukaj?query=${encoded}`,
    'tvp vod': `https://vod.tvp.pl/szukaj?query=${encoded}`,
    'skyshowtime': `https://www.skyshowtime.com/search?q=${encoded}`,
    'viaplay': `https://viaplay.pl/search?query=${encoded}`,
    'mubi': `https://mubi.com/search?query=${encoded}`,
    'rakuten tv': `https://www.rakuten.tv/pl/search?q=${encoded}`,
    'curiositystream': `https://curiositystream.com/search/${encoded}`,
    'crunchyroll': `https://www.crunchyroll.com/search?q=${encoded}`,
    'peacock': `https://www.peacocktv.com/search?q=${encoded}`,
  };
  return searchUrls[key] || getServiceHomeUrl(key);
}
