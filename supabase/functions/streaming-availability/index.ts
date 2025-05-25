
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log(`Fetching streaming availability for movie: ${tmdbId} in country: ${country}, title: ${title}, year: ${year}`)

    let streamingServices = []
    let apiError = null
    
    // Try multiple API endpoints for better coverage
    const apiEndpoints = [
      // Current v4 API
      {
        name: 'v4-direct',
        url: `https://streaming-availability.p.rapidapi.com/v4/shows/movie/${tmdbId}`,
        params: { country: country.toLowerCase() }
      },
      // Legacy v3 API as fallback
      {
        name: 'v3-direct', 
        url: `https://streaming-availability.p.rapidapi.com/v3/movie/${tmdbId}`,
        params: { country: country.toLowerCase() }
      }
    ]

    // Try each endpoint
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
          console.log(`${endpoint.name} - Response structure:`, Object.keys(data))
          
          // Handle different API response structures
          let streamingInfo = null
          
          if (data.streamingInfo) {
            // v4 API structure
            streamingInfo = data.streamingInfo
          } else if (data.result && data.result.streamingInfo) {
            // Alternative v4 structure
            streamingInfo = data.result.streamingInfo
          } else if (data.streamingOptions) {
            // v3 API structure
            const countryData = data.streamingOptions[country.toLowerCase()]
            if (countryData) {
              streamingInfo = { [country.toLowerCase()]: countryData }
            }
          }
          
          if (streamingInfo && streamingInfo[country.toLowerCase()]) {
            const countryStreamingOptions = streamingInfo[country.toLowerCase()]
            
            streamingServices = Object.entries(countryStreamingOptions).map(([service, options]) => {
              const streamingOptions = Array.isArray(options) ? options : [options];
              const firstOption = streamingOptions[0] || {}
              
              return {
                service: normalizeServiceName(service),
                link: firstOption.link || generateDefaultLink(service),
                available: true,
                type: firstOption.type || 'subscription',
                source: endpoint.name
              };
            }).filter(service => service.service && service.link)
            
            if (streamingServices.length > 0) {
              console.log(`Found ${streamingServices.length} services via ${endpoint.name}`)
              break
            }
          }
        } else {
          console.log(`${endpoint.name} failed: ${response.status} ${response.statusText}`)
          apiError = `${response.status} ${response.statusText}`
        }
      } catch (error) {
        console.log(`${endpoint.name} error:`, error.message)
        apiError = error.message
      }
    }
    
    // If direct lookups failed, try title search
    if (streamingServices.length === 0 && title) {
      try {
        console.log('Attempting title search')
        
        const searchEndpoints = [
          {
            name: 'v4-search',
            url: 'https://streaming-availability.p.rapidapi.com/v4/search',
            params: {
              query: title,
              country: country.toLowerCase(),
              type: 'movie',
              output_language: 'en'
            }
          },
          {
            name: 'v3-search',
            url: 'https://streaming-availability.p.rapidapi.com/v3/search',
            params: {
              title: title,
              country: country.toLowerCase(),
              output_language: 'en',
              show_type: 'movie'
            }
          }
        ]
        
        if (year) {
          searchEndpoints.forEach(endpoint => {
            endpoint.params.year = year
          })
        }
        
        for (const searchEndpoint of searchEndpoints) {
          try {
            const searchParams = new URLSearchParams(searchEndpoint.params)
            const searchUrl = `${searchEndpoint.url}?${searchParams.toString()}`
            console.log(`Trying ${searchEndpoint.name}: ${searchUrl}`)
            
            const searchResponse = await fetch(searchUrl, {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
              }
            })
            
            if (searchResponse.ok) {
              const searchData = await searchResponse.json()
              
              let matches = []
              if (searchData.matches) {
                matches = searchData.matches
              } else if (searchData.result) {
                matches = Array.isArray(searchData.result) ? searchData.result : [searchData.result]
              }
              
              if (matches && matches.length > 0) {
                console.log(`${searchEndpoint.name} found ${matches.length} matches`)
                
                // Find exact match by TMDB ID or best match by title/year
                let bestMatch = matches.find(movie => 
                  movie.tmdbId === tmdbId || String(movie.tmdbId) === String(tmdbId)
                ) || matches[0]
                
                if (year && !bestMatch.tmdbId) {
                  const yearMatches = matches.filter(movie => 
                    movie.year === parseInt(year) || 
                    (movie.firstAirYear && movie.firstAirYear === parseInt(year))
                  )
                  if (yearMatches.length > 0) {
                    bestMatch = yearMatches[0]
                  }
                }
                
                if (bestMatch && bestMatch.streamingInfo && bestMatch.streamingInfo[country.toLowerCase()]) {
                  const countryStreamingOptions = bestMatch.streamingInfo[country.toLowerCase()]
                  
                  streamingServices = Object.entries(countryStreamingOptions).map(([service, options]) => {
                    const streamingOptions = Array.isArray(options) ? options : [options];
                    const firstOption = streamingOptions[0] || {}
                    
                    return {
                      service: normalizeServiceName(service),
                      link: firstOption.link || generateDefaultLink(service),
                      available: true,
                      type: firstOption.type || 'subscription',
                      source: searchEndpoint.name
                    };
                  }).filter(service => service.service && service.link)
                  
                  if (streamingServices.length > 0) {
                    console.log(`Found ${streamingServices.length} services via ${searchEndpoint.name}`)
                    break
                  }
                }
              }
            } else {
              console.log(`${searchEndpoint.name} failed: ${searchResponse.status}`)
            }
          } catch (searchError) {
            console.log(`${searchEndpoint.name} error:`, searchError.message)
          }
        }
      } catch (titleError) {
        console.log('Title search failed:', titleError.message)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        result: streamingServices,
        timestamp: new Date().toISOString(),
        source: streamingServices.length > 0 ? streamingServices[0].source || 'api' : 'not-found',
        apiError: streamingServices.length === 0 ? apiError : null
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
        result: []
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

// Helper function to normalize service names
function normalizeServiceName(serviceName: string): string {
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
    'paramount': 'Paramount+',
    'paramountplus': 'Paramount+',
    'peacock': 'Peacock',
    'showtime': 'Showtime',
    'starz': 'Starz'
  }
  
  const normalized = serviceName.toLowerCase().trim()
  return serviceMap[normalized] || serviceName
}

// Helper function to generate default links
function generateDefaultLink(serviceName: string): string {
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
    'paramountplus': 'https://www.paramountplus.com'
  }
  
  return linkMap[normalized] || `https://www.${normalized}.com`
}
