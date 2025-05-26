
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced service name mapping for consistency
function normalizeServiceName(serviceName: string): string {
  if (!serviceName) return 'Unknown'
  
  const serviceMap: Record<string, string> = {
    'netflix': 'Netflix',
    'amazon': 'Prime Video',
    'amazonprime': 'Prime Video',
    'prime': 'Prime Video',
    'primevideo': 'Prime Video',
    'disney': 'Disney+',
    'disneyplus': 'Disney+',
    'hulu': 'Hulu',
    'hbo': 'HBO Max',
    'hbomax': 'HBO Max',
    'max': 'Max',
    'apple': 'Apple TV+',
    'appletv': 'Apple TV+',
    'appletv+': 'Apple TV+',
    'paramount': 'Paramount+',
    'paramountplus': 'Paramount+',
    'peacock': 'Peacock',
    'showtime': 'Showtime',
    'starz': 'Starz',
    'cinemax': 'Cinemax',
    'crunchyroll': 'Crunchyroll',
    'funimation': 'Funimation'
  }
  
  const normalized = serviceName.toLowerCase().trim().replace(/[\s\-_]/g, '')
  return serviceMap[normalized] || serviceName
}

// Enhanced link generation
function generateDefaultLink(serviceName: string): string {
  if (!serviceName) return ''
  
  const normalized = serviceName.toLowerCase().replace(/[\s+]/g, '')
  
  const linkMap: Record<string, string> = {
    'netflix': 'https://www.netflix.com',
    'primevideo': 'https://www.primevideo.com',
    'amazon': 'https://www.primevideo.com',
    'prime': 'https://www.primevideo.com',
    'disney': 'https://www.disneyplus.com',
    'disneyplus': 'https://www.disneyplus.com',
    'hulu': 'https://www.hulu.com',
    'hbomax': 'https://play.max.com',
    'max': 'https://play.max.com',
    'apple': 'https://tv.apple.com',
    'appletv': 'https://tv.apple.com',
    'paramount': 'https://www.paramountplus.com',
    'paramountplus': 'https://www.paramountplus.com',
    'peacock': 'https://www.peacocktv.com',
    'showtime': 'https://www.showtime.com',
    'starz': 'https://www.starz.com'
  }
  
  return linkMap[normalized] || `https://www.${normalized}.com`
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tmdbId, country = 'us', title, year } = await req.json()
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY not configured')
      return new Response(
        JSON.stringify({ 
          error: 'RAPIDAPI_KEY not configured',
          result: [] 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      )
    }

    // FORCE US REGION - CRITICAL FIX
    const forceRegion = 'us'
    console.log(`Fetching streaming availability for movie: ${tmdbId} in FORCED region: ${forceRegion}, title: ${title}, year: ${year}`)

    let streamingServices = []
    let apiError = null
    
    // Use latest API v2 endpoints from documentation
    const apiEndpoints = [
      // Latest v2 API - primary endpoint
      {
        name: 'v2-direct',
        url: `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}`,
        params: { country: forceRegion }
      },
      // Alternative v2 search endpoint
      {
        name: 'v2-search',
        url: 'https://streaming-availability.p.rapidapi.com/shows/search/filters',
        params: { 
          country: forceRegion,
          catalogs: 'netflix,prime,disney,hulu,hbo,apple,paramount',
          show_type: 'movie',
          tmdb_id: tmdbId.toString()
        }
      }
    ]

    // Try each endpoint with proper error handling
    for (const endpoint of apiEndpoints) {
      try {
        const queryParams = new URLSearchParams(endpoint.params)
        const fullUrl = `${endpoint.url}?${queryParams.toString()}`
        console.log(`Trying ${endpoint.name}: ${fullUrl}`)

        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        }
        
        const response = await fetch(fullUrl, options)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`${endpoint.name} - Response received:`, data ? 'Success' : 'Empty')
          
          // Handle v2 API response structure
          let shows = []
          
          if (endpoint.name === 'v2-direct' && data) {
            // Direct lookup response
            shows = [data]
          } else if (endpoint.name === 'v2-search' && data && data.shows) {
            // Search response
            shows = data.shows
          }
          
          if (shows && shows.length > 0) {
            const show = shows[0]
            
            // Extract streaming options from v2 API structure
            if (show.streamingOptions && show.streamingOptions[forceRegion]) {
              const countryStreamingOptions = show.streamingOptions[forceRegion]
              
              streamingServices = countryStreamingOptions.map(option => ({
                service: normalizeServiceName(option.service?.name || 'Unknown'),
                link: option.link || generateDefaultLink(option.service?.name || ''),
                available: true,
                type: option.type || 'subscription',
                source: endpoint.name,
                quality: option.quality || 'hd',
                price: option.price ? `${option.price.amount} ${option.price.currency}` : null
              })).filter(service => service.service && service.service !== 'Unknown')
              
              if (streamingServices.length > 0) {
                console.log(`Found ${streamingServices.length} services via ${endpoint.name}`)
                break
              }
            }
          }
        } else {
          const errorText = await response.text()
          console.log(`${endpoint.name} failed: ${response.status} ${response.statusText} - ${errorText}`)
          apiError = `${response.status} ${response.statusText}`
        }
      } catch (error) {
        console.log(`${endpoint.name} error:`, error.message)
        apiError = error.message
      }
    }
    
    // If direct lookups failed, try title search as fallback
    if (streamingServices.length === 0 && title) {
      try {
        console.log('Attempting title search fallback')
        
        const searchParams = new URLSearchParams({
          country: forceRegion,
          title: title,
          show_type: 'movie',
          output_language: 'en'
        })
        
        if (year) {
          searchParams.set('year', year)
        }
        
        const searchUrl = `https://streaming-availability.p.rapidapi.com/shows/search/title?${searchParams.toString()}`
        console.log(`Trying title search: ${searchUrl}`)
        
        const searchResponse = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          
          if (searchData && searchData.shows && searchData.shows.length > 0) {
            console.log(`Title search found ${searchData.shows.length} matches`)
            
            // Find best match by TMDB ID or first result
            let bestMatch = searchData.shows.find(show => 
              show.tmdbId === tmdbId || String(show.tmdbId) === String(tmdbId)
            ) || searchData.shows[0]
            
            if (bestMatch && bestMatch.streamingOptions && bestMatch.streamingOptions[forceRegion]) {
              const countryStreamingOptions = bestMatch.streamingOptions[forceRegion]
              
              streamingServices = countryStreamingOptions.map(option => ({
                service: normalizeServiceName(option.service?.name || 'Unknown'),
                link: option.link || generateDefaultLink(option.service?.name || ''),
                available: true,
                type: option.type || 'subscription',
                source: 'title-search',
                quality: option.quality || 'hd',
                price: option.price ? `${option.price.amount} ${option.price.currency}` : null
              })).filter(service => service.service && service.service !== 'Unknown')
              
              if (streamingServices.length > 0) {
                console.log(`Found ${streamingServices.length} services via title search`)
              }
            }
          }
        } else {
          console.log(`Title search failed: ${searchResponse.status}`)
        }
      } catch (titleError) {
        console.log('Title search failed:', titleError.message)
      }
    }
    
    // Deduplikacja serwisów
    const uniqueServices = streamingServices.reduce((acc, current) => {
      const existing = acc.find(item => item.service === current.service)
      if (!existing) {
        acc.push(current)
      }
      return acc
    }, [])
    
    return new Response(
      JSON.stringify({ 
        result: uniqueServices,
        timestamp: new Date().toISOString(),
        source: uniqueServices.length > 0 ? uniqueServices[0].source || 'api' : 'not-found',
        apiError: uniqueServices.length === 0 ? apiError : null,
        region: forceRegion,
        tmdbId: tmdbId,
        totalFound: uniqueServices.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in streaming-availability function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        result: [],
        region: 'us',
        source: 'error'
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
