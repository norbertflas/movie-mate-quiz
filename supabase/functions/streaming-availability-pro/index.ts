
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? 
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

interface StreamingRequest {
  tmdbIds: number[];
  country?: string;
  mode?: 'instant' | 'lazy';
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
  hasStreaming: boolean;
  lastUpdated: string;
}

// Rate limiting state
let requestCount = 0;
let lastResetTime = Date.now();
const MAX_REQUESTS_PER_SECOND = 95;

const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastResetTime > 1000) {
    requestCount = 0;
    lastResetTime = now;
  }
  return requestCount < MAX_REQUESTS_PER_SECOND;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchStreamingData = async (tmdbId: number, country: string): Promise<MovieStreamingData | null> => {
  if (!checkRateLimit()) {
    console.log('Rate limit reached, queuing request...');
    await delay(1000);
  }

  requestCount++;

  try {
    const endpoints = [
      `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}?country=${country}`,
      `https://streaming-availability.p.rapidapi.com/shows/series/${tmdbId}?country=${country}`
    ];

    let data: any = null;

    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY!,
          'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
        }
      });

      if (response.ok) {
        data = await response.json();
        break;
      }

      if (response.status === 429) {
        console.log('Rate limited by API, waiting...');
        await delay(2000);
        continue;
      }

      if (response.status !== 404) {
        throw new Error(`API error: ${response.status}`);
      }
    }

    if (!data) {
      console.log(`Title ${tmdbId} not found (movie/series)`);
      return null;
    }

    console.log(`Raw API response keys for ${tmdbId}:`, Object.keys(data));
    console.log(`streamingOptions keys:`, data.streamingOptions ? Object.keys(data.streamingOptions) : 'none');
    console.log(`streamingInfo keys:`, data.streamingInfo ? Object.keys(data.streamingInfo) : 'none');
    
    const streamingOptions: StreamingOption[] = [];
    const availableServices: string[] = [];

    // Process streaming options - support both v3 (streamingInfo) and v4 (streamingOptions) API structures
    // v4 API: streamingOptions is an object with country codes as keys, each containing arrays
    const countryData = data.streamingOptions?.[country] || data.streamingInfo?.[country] || [];
    console.log(`Country data for ${country}:`, JSON.stringify(countryData).substring(0, 500));
    
    // v4 API: countryData is an array of streaming option objects
    const streamingEntries = Array.isArray(countryData) ? countryData : Object.entries(countryData);
    
    for (const item of (Array.isArray(countryData) ? countryData : [])) {
      const serviceId = item.service?.id || item.service || 'unknown';
      const streamingOption: StreamingOption = {
        service: getServiceDisplayName(serviceId),
        serviceLogo: getServiceLogo(serviceId),
        link: item.link || getServiceHomeUrl(serviceId),
        type: getStreamingType(item),
        quality: item.quality || 'HD',
        price: item.price ? {
          amount: parseFloat(item.price.amount),
          currency: item.price.currency,
          formatted: item.price.formatted
        } : undefined
      };
      streamingOptions.push(streamingOption);
      if (!availableServices.includes(streamingOption.service)) {
        availableServices.push(streamingOption.service);
      }
    }
    
    // Fallback: v3 API format (object with serviceId keys -> arrays of options)
    if (streamingOptions.length === 0 && !Array.isArray(countryData) && typeof countryData === 'object') {
      for (const [serviceId, options] of Object.entries(countryData)) {
        if (Array.isArray(options) && options.length > 0) {
          for (const option of options) {
            const streamingOption: StreamingOption = {
              service: getServiceDisplayName(serviceId),
              serviceLogo: getServiceLogo(serviceId),
              link: (option as any).link || getServiceHomeUrl(serviceId),
              type: getStreamingType(option),
              quality: (option as any).quality || 'HD',
              price: (option as any).price ? {
                amount: parseFloat((option as any).price.amount),
                currency: (option as any).price.currency,
                formatted: (option as any).price.formatted
              } : undefined
            };
            streamingOptions.push(streamingOption);
            if (!availableServices.includes(streamingOption.service)) {
              availableServices.push(streamingOption.service);
            }
          }
        }
      }
    }

    return {
      tmdbId,
      title: data.title || '',
      streamingOptions,
      availableServices,
      hasStreaming: streamingOptions.length > 0,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error fetching streaming data for ${tmdbId}:`, error);
    return null;
  }
};

const processBatch = async (tmdbIds: number[], country: string): Promise<MovieStreamingData[]> => {
  const results: MovieStreamingData[] = [];
  const BATCH_SIZE = 50;
  const BATCH_DELAY = 100; // ms between batches

  for (let i = 0; i < tmdbIds.length; i += BATCH_SIZE) {
    const batch = tmdbIds.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}, movies ${i + 1}-${Math.min(i + BATCH_SIZE, tmdbIds.length)}`);

    const batchPromises = batch.map(tmdbId => fetchStreamingData(tmdbId, country));
    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      } else {
        console.error(`Failed to fetch data for TMDB ID ${batch[index]}`);
      }
    });

    // Add delay between batches to respect rate limits
    if (i + BATCH_SIZE < tmdbIds.length) {
      await delay(BATCH_DELAY);
    }
  }

  return results;
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    if (!RAPIDAPI_KEY) {
      return new Response(
        JSON.stringify({ error: "RapidAPI key not configured" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }

    const { tmdbIds, country = 'us', mode = 'lazy' }: StreamingRequest = await req.json();

    if (!tmdbIds || !Array.isArray(tmdbIds) || tmdbIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid tmdbIds array" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    console.log(`Processing ${tmdbIds.length} movies in ${mode} mode for country: ${country}`);

    // Track API usage
    if (supabase) {
      await supabase.rpc('increment_api_usage', {
        p_service: 'streaming-availability-pro',
        p_date: new Date().toISOString().split('T')[0],
        p_hour: new Date().getHours(),
        p_minute: new Date().getMinutes()
      });
    }

    const results = await processBatch(tmdbIds, country);

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        totalProcessed: tmdbIds.length,
        totalFound: results.length,
        mode,
        country,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in streaming-availability-pro function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

// Helper functions
function getServiceDisplayName(serviceId: string): string {
  const serviceNames: Record<string, string> = {
    'netflix': 'Netflix',
    'prime': 'Amazon Prime Video',
    'disney': 'Disney+',
    'hbo': 'HBO Max',
    'hulu': 'Hulu',
    'apple': 'Apple TV+',
    'paramount': 'Paramount+',
    'canal': 'Canal+',
    'player': 'Player.pl',
    'polsat': 'Polsat Box Go',
    'tvp': 'TVP VOD'
  }
  
  return serviceNames[serviceId] || serviceId.charAt(0).toUpperCase() + serviceId.slice(1)
}

function getServiceLogo(serviceId: string): string {
  const logoMap: Record<string, string> = {
    'netflix': '/streaming-icons/netflix.svg',
    'prime': '/streaming-icons/prime.svg',
    'disney': '/streaming-icons/disney.svg',
    'hbo': '/streaming-icons/hbomax.svg',
    'hulu': '/streaming-icons/hulu.svg',
    'apple': '/streaming-icons/apple.svg',
    'paramount': '/streaming-icons/paramount.svg'
  }
  
  return logoMap[serviceId] || '/streaming-icons/default.svg'
}

function getStreamingType(option: any): 'subscription' | 'rent' | 'buy' | 'free' {
  if (option.type === 'subscription') return 'subscription'
  if (option.type === 'rent') return 'rent'
  if (option.type === 'buy') return 'buy'
  if (option.type === 'free') return 'free'
  return 'subscription' // default
}

function getServiceHomeUrl(serviceId: string): string {
  const serviceUrls: Record<string, string> = {
    'netflix': 'https://netflix.com',
    'prime': 'https://amazon.com/prime-video',
    'disney': 'https://disneyplus.com',
    'hbo': 'https://max.com',
    'hulu': 'https://hulu.com',
    'apple': 'https://tv.apple.com',
    'paramount': 'https://paramountplus.com',
    'canal': 'https://canalplus.pl',
    'player': 'https://player.pl',
    'polsat': 'https://polsatboxgo.pl',
    'tvp': 'https://vod.tvp.pl'
  }
  
  return serviceUrls[serviceId] || `https://${serviceId}.com`
}
