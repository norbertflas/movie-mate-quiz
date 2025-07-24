
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Emergency mode settings
const EMERGENCY_MODE = false; // Disabled to use real MovieOfTheNight API
const RAPID_API_DAILY_LIMIT = 500;
const WATCHMODE_DAILY_LIMIT = 100;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { tmdbId, country = 'US', title, year, forceRefresh = false } = await req.json()
    
    console.log(`🔍 [Edge] Request: ${tmdbId} in ${country}`)

    // STEP 1: Emergency brake check
    const { data: emergencyMode } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'emergency_mode')
      .maybeSingle()

    if (emergencyMode?.value?.active || EMERGENCY_MODE) {
      console.log('🚨 [Edge] Emergency mode active, using fallback only')
      
      const fallbackServices = generateFallbackServices(country)
      return new Response(JSON.stringify({
        result: fallbackServices,
        source: 'emergency_fallback',
        emergency_mode: true,
        message: 'API limits exceeded or emergency mode active, using fallback data'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // STEP 2: Check cache (if not force refresh)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('streaming_cache')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .eq('country', country.toUpperCase())
        .gte('expires_at', new Date().toISOString())
        .maybeSingle()

      if (cached) {
        console.log(`📦 [Edge] Cache HIT for ${tmdbId}`)
        
        // Update hit count
        await supabase
          .from('streaming_cache')
          .update({ 
            hit_count: cached.hit_count + 1,
            last_accessed: new Date().toISOString()
          })
          .eq('id', cached.id)

        return new Response(JSON.stringify({
          result: cached.streaming_data,
          source: 'cache',
          cached_at: cached.cached_at,
          hit_count: cached.hit_count + 1
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // STEP 3: Check rate limiting
    const today = new Date().toISOString().split('T')[0]
    
    const { data: todayStats } = await supabase
      .from('api_usage_stats')
      .select('*')
      .eq('date', today)

    const rapidApiCalls = todayStats?.find((s: any) => s.service === 'rapidapi')?.daily_calls || 0
    const watchmodeCalls = todayStats?.find((s: any) => s.service === 'watchmode')?.daily_calls || 0

    // Check limits
    const canUseRapidApi = rapidApiCalls < RAPID_API_DAILY_LIMIT
    const canUseWatchmode = watchmodeCalls < WATCHMODE_DAILY_LIMIT

    if (!canUseRapidApi && !canUseWatchmode) {
      console.log('🚫 [Edge] All APIs rate limited')
      
      // Activate emergency mode if limits exceeded
      if (rapidApiCalls >= RAPID_API_DAILY_LIMIT * 0.9 || watchmodeCalls >= WATCHMODE_DAILY_LIMIT * 0.9) {
        await supabase
          .from('system_settings')
          .upsert({
            key: 'emergency_mode',
            value: {
              active: true,
              reason: `Rate limits exceeded: RapidAPI ${rapidApiCalls}/${RAPID_API_DAILY_LIMIT}, Watchmode ${watchmodeCalls}/${WATCHMODE_DAILY_LIMIT}`,
              activated_at: new Date().toISOString()
            }
          })
      }

      const fallbackServices = generateFallbackServices(country)
      
      // Cache fallback for longer period
      await supabase
        .from('streaming_cache')
        .upsert({
          tmdb_id: tmdbId,
          country: country.toUpperCase(),
          streaming_data: fallbackServices,
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          source: 'rate_limited_fallback'
        })

      return new Response(JSON.stringify({
        result: fallbackServices,
        source: 'rate_limited_fallback',
        rate_limit_info: {
          rapidapi_calls: rapidApiCalls,
          watchmode_calls: watchmodeCalls
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // STEP 4: Try MovieOfTheNight API
    console.log('🎬 [Edge] Calling MovieOfTheNight API for streaming data')
    
    try {
      const streamingData = await getMovieStreamingData(tmdbId, country, title, year)
      
      // Cache the API results
      const cacheHours = 24 * 3 // 3 days for API data
      const expiresAt = new Date(Date.now() + cacheHours * 60 * 60 * 1000)

      await supabase
        .from('streaming_cache')
        .upsert({
          tmdb_id: tmdbId,
          country: country.toUpperCase(),
          streaming_data: streamingData,
          cached_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          source: 'movieofthenight_api'
        })

      // Record API usage
      await recordAPICall('rapidapi', supabase)

      return new Response(JSON.stringify({
        result: streamingData,
        source: 'movieofthenight_api',
        api_calls_remaining: {
          rapidapi: RAPID_API_DAILY_LIMIT - rapidApiCalls - 1,
          watchmode: WATCHMODE_DAILY_LIMIT - watchmodeCalls
        },
        cached_until: expiresAt.toISOString()
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (apiError) {
      console.error('❌ [Edge] MovieOfTheNight API failed:', apiError)
      
      // Only return fallback if the API actually failed, not if movie wasn't found
      console.log(`🏠 [Edge] Using fallback services for ${country}`)
      const fallbackServices = generateFallbackServices(country)
      const cacheHours = 6 // 6 hours for fallback when API fails
      const expiresAt = new Date(Date.now() + cacheHours * 60 * 60 * 1000)

      await supabase
        .from('streaming_cache')
        .upsert({
          tmdb_id: tmdbId,
          country: country.toUpperCase(),
          streaming_data: fallbackServices,
          cached_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          source: 'api_error_fallback'
        })

      return new Response(JSON.stringify({
        result: fallbackServices,
        source: 'api_error_fallback',
        error: apiError.message,
        api_calls_remaining: {
          rapidapi: RAPID_API_DAILY_LIMIT - rapidApiCalls,
          watchmode: WATCHMODE_DAILY_LIMIT - watchmodeCalls
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

  } catch (error) {
    console.error('❌ [Edge] Error:', error)
    
    // Emergency fallback
    const fallbackServices = generateFallbackServices('US')
    
    return new Response(JSON.stringify({
      result: fallbackServices,
      source: 'error_fallback',
      error: error.message
    }), { 
      status: 200, // 200 so frontend doesn't break
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Generate fallback services based on country
function generateFallbackServices(country: string) {
  const servicesByRegion: Record<string, any[]> = {
    'US': [
      { service: 'Netflix', link: 'https://netflix.com', available: true, type: 'subscription' },
      { service: 'Amazon Prime Video', link: 'https://amazon.com/prime-video', available: true, type: 'subscription' },
      { service: 'Disney+', link: 'https://disneyplus.com', available: true, type: 'subscription' },
      { service: 'Hulu', link: 'https://hulu.com', available: true, type: 'subscription' },
      { service: 'Apple TV+', link: 'https://tv.apple.com', available: true, type: 'subscription' }
    ],
    'PL': [
      { service: 'Netflix', link: 'https://netflix.com', available: true, type: 'subscription' },
      { service: 'Amazon Prime Video', link: 'https://amazon.com/prime-video', available: true, type: 'subscription' },
      { service: 'Disney+', link: 'https://disneyplus.com', available: true, type: 'subscription' },
      { service: 'Canal+', link: 'https://canalplus.pl', available: true, type: 'subscription' },
      { service: 'Player.pl', link: 'https://player.pl', available: true, type: 'subscription' }
    ],
    'GB': [
      { service: 'Netflix', link: 'https://netflix.com', available: true, type: 'subscription' },
      { service: 'Amazon Prime Video', link: 'https://amazon.com/prime-video', available: true, type: 'subscription' },
      { service: 'Disney+', link: 'https://disneyplus.com', available: true, type: 'subscription' },
      { service: 'BBC iPlayer', link: 'https://iplayer.bbc.co.uk', available: true, type: 'free' }
    ]
  };

  return servicesByRegion[country.toUpperCase()] || servicesByRegion['US'];
}

// Get streaming data from MovieOfTheNight API
async function getMovieStreamingData(tmdbId: number, country: string, title?: string, year?: number) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
  if (!rapidApiKey) {
    throw new Error('RAPIDAPI_KEY not configured')
  }

  // Try to get by TMDB ID first
  let movieData = null
  
  try {
    console.log(`🔍 [MovieOfTheNight] Searching by TMDB ID: ${tmdbId}`)
    
    const response = await fetch(`https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}?country=${country.toLowerCase()}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
      }
    })

    if (response.ok) {
      movieData = await response.json()
      console.log(`✅ [MovieOfTheNight] Found by TMDB ID: ${movieData.title}`)
    } else {
      console.log(`⚠️ [MovieOfTheNight] TMDB ID ${tmdbId} not found, trying search...`)
    }
  } catch (error) {
    console.log(`⚠️ [MovieOfTheNight] TMDB ID search failed: ${error.message}`)
  }

  // If TMDB ID lookup failed, try search by title
  if (!movieData && title) {
    try {
      console.log(`🔍 [MovieOfTheNight] Searching by title: ${title}`)
      
      const searchParams = new URLSearchParams({
        country: country.toLowerCase(),
        show_type: 'movie',
        output_language: 'en'
      })
      
      if (title) searchParams.append('keyword', title)
      if (year) searchParams.append('year_min', year.toString())
      if (year) searchParams.append('year_max', year.toString())

      const searchResponse = await fetch(
        `https://streaming-availability.p.rapidapi.com/shows/search/title?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        }
      )

      if (searchResponse.ok) {
        const searchResults = await searchResponse.json()
        if (searchResults?.length > 0) {
          movieData = searchResults[0]
          console.log(`✅ [MovieOfTheNight] Found by search: ${movieData.title}`)
        }
      }
    } catch (error) {
      console.error(`❌ [MovieOfTheNight] Search failed: ${error.message}`)
    }
  }

  if (!movieData) {
    console.log(`❌ [MovieOfTheNight] No data found for TMDB ID ${tmdbId}`)
    // Return fallback instead of throwing error
    return generateFallbackServices(country)
  }

  // Extract streaming services for the target country
  const streamingInfo = movieData.streamingInfo?.[country.toLowerCase()] || {}
  const services = []

  // Process different streaming types
  for (const [serviceId, options] of Object.entries(streamingInfo)) {
    if (Array.isArray(options) && options.length > 0) {
      const option = options[0] // Take first option
      
      services.push({
        service: getServiceDisplayName(serviceId),
        type: getStreamingType(option),
        link: option.link || getServiceHomeUrl(serviceId),
        available: true,
        quality: option.quality || 'hd',
        price: option.price ? {
          amount: option.price.amount,
          currency: option.price.currency,
          formatted: option.price.formatted
        } : undefined
      })
    }
  }

  console.log(`📺 [MovieOfTheNight] Found ${services.length} streaming options for ${country}`)
  
  return services.length > 0 ? services : generateFallbackServices(country)
}

// Helper functions for MovieOfTheNight API
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

function getStreamingType(option: any): string {
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

// Record API call for usage tracking
async function recordAPICall(service: string, supabase: any) {
  const today = new Date().toISOString().split('T')[0]
  const currentHour = new Date().getHours()
  const currentMinute = Math.floor(Date.now() / 60000)

  await supabase.rpc('increment_api_usage', {
    p_service: service,
    p_date: today,
    p_hour: currentHour,
    p_minute: currentMinute
  })
}
