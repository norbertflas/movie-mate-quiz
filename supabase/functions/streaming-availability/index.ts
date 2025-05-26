
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapeowanie nazw serwisów na standardowe nazwy
function normalizeServiceName(serviceName: string): string {
  const serviceMap: Record<string, string> = {
    'netflix': 'Netflix',
    'prime': 'Amazon Prime Video',
    'disney': 'Disney+',
    'hulu': 'Hulu',
    'hbo': 'HBO Max',
    'apple': 'Apple TV+',
    'paramount': 'Paramount+',
    'peacock': 'Peacock',
    'showtime': 'Showtime',
    'starz': 'Starz',
    'crunchyroll': 'Crunchyroll',
    'funimation': 'Funimation'
  }
  
  const normalized = serviceName?.toLowerCase() || ''
  return serviceMap[normalized] || serviceName || 'Unknown'
}

// Generowanie domyślnych linków
function generateDefaultLink(serviceName: string): string {
  const linkMap: Record<string, string> = {
    'netflix': 'https://www.netflix.com',
    'prime': 'https://www.amazon.com/prime-video',
    'disney': 'https://www.disneyplus.com',
    'hulu': 'https://www.hulu.com',
    'hbo': 'https://www.hbomax.com',
    'apple': 'https://tv.apple.com',
    'paramount': 'https://www.paramountplus.com'
  }
  
  const key = serviceName?.toLowerCase() || ''
  return linkMap[key] || '#'
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

    const forceRegion = 'us'
    console.log(`Fetching streaming availability for movie: ${tmdbId} in region: ${forceRegion}`)

    let streamingServices = []
    let apiError = null
    
    // POPRAWIONE ENDPOINTY API V3
    const apiEndpoints = [
      // Główny endpoint dla filmów
      {
        name: 'v3-movie-direct',
        url: `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}`,
        params: { country: forceRegion }
      },
      // Wyszukiwanie po tytule
      {
        name: 'v3-title-search',
        url: 'https://streaming-availability.p.rapidapi.com/shows/search/title',
        params: { 
          country: forceRegion,
          title: title || '',
          show_type: 'movie',
          output_language: 'en'
        }
      }
    ]

    // Dodaj rok do wyszukiwania po tytule jeśli dostępny
    if (year && apiEndpoints[1]) {
      apiEndpoints[1].params.year = year
    }

    // Próbuj każdy endpoint
    for (const endpoint of apiEndpoints) {
      try {
        // Pomiń wyszukiwanie po tytule jeśli nie ma tytułu
        if (endpoint.name === 'v3-title-search' && !title) {
          continue
        }

        const queryParams = new URLSearchParams()
        Object.entries(endpoint.params).forEach(([key, value]) => {
          if (value) queryParams.set(key, String(value))
        })
        
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
          console.log(`${endpoint.name} - Response status: ${response.status}`)
          
          let shows = []
          
          // Obsługa różnych struktur odpowiedzi
          if (endpoint.name === 'v3-movie-direct' && data) {
            shows = [data]
          } else if (endpoint.name === 'v3-title-search' && data && Array.isArray(data)) {
            shows = data
          } else if (data && data.shows && Array.isArray(data.shows)) {
            shows = data.shows
          }
          
          if (shows && shows.length > 0) {
            console.log(`Found ${shows.length} shows`)
            
            // Znajdź najlepsze dopasowanie
            let bestMatch = shows[0]
            if (shows.length > 1 && tmdbId) {
              const exactMatch = shows.find(show => 
                show.tmdbId === tmdbId || 
                String(show.tmdbId) === String(tmdbId)
              )
              if (exactMatch) bestMatch = exactMatch
            }
            
            // Wyciągnij informacje o streamingu
            if (bestMatch.streamingOptions && bestMatch.streamingOptions[forceRegion]) {
              const countryOptions = bestMatch.streamingOptions[forceRegion]
              
              streamingServices = countryOptions.map(option => ({
                service: normalizeServiceName(option.service?.id || option.service?.name || 'Unknown'),
                link: option.link || generateDefaultLink(option.service?.id || option.service?.name || ''),
                available: true,
                type: option.type || 'subscription',
                source: endpoint.name,
                quality: option.quality || 'hd',
                price: option.price ? `${option.price.amount} ${option.price.currency}` : null,
                audios: option.audios || [],
                subtitles: option.subtitles || []
              })).filter(service => 
                service.service && 
                service.service !== 'Unknown' && 
                service.service !== 'unknown'
              )
              
              if (streamingServices.length > 0) {
                console.log(`Found ${streamingServices.length} services via ${endpoint.name}`)
                break
              }
            }
          }
        } else {
          const errorText = await response.text()
          console.log(`${endpoint.name} failed: ${response.status} ${response.statusText}`)
          console.log(`Error details: ${errorText}`)
          apiError = `${response.status} ${response.statusText}`
          
          // Jeśli 404, to znaczy że film nie istnieje w bazie
          if (response.status === 404) {
            console.log('Movie not found in streaming database')
            break
          }
        }
      } catch (error) {
        console.log(`${endpoint.name} error:`, error.message)
        apiError = error.message
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
    
    const result = {
      result: uniqueServices,
      timestamp: new Date().toISOString(),
      source: uniqueServices.length > 0 ? uniqueServices[0].source || 'api' : 'not-found',
      apiError: uniqueServices.length === 0 ? apiError : null,
      region: forceRegion,
      tmdbId: tmdbId,
      totalFound: uniqueServices.length
    }
    
    console.log(`Final result: ${uniqueServices.length} unique services`)
    
    return new Response(
      JSON.stringify(result),
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
