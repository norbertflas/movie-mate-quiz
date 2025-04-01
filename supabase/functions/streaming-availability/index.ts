
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
    const { tmdbId, country = 'us' } = await req.json()
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY not configured')
      throw new Error('RAPIDAPI_KEY not configured')
    }

    console.log(`Fetching streaming availability for movie: ${tmdbId} in country: ${country}`)

    // Using the RapidAPI Movies-TV-Shows-Database endpoint
    const url = `https://movies-tv-shows-database.p.rapidapi.com/movie/id/${tmdbId}/streaminginfo`
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'movies-tv-shows-database.p.rapidapi.com',
        'Type': 'get-movie-details',
        'country': country.toUpperCase()
      }
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      return new Response(
        JSON.stringify({ 
          error: `API error: ${response.status}`,
          result: [] 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200 // Return 200 even on API error to prevent client crashing
        }
      )
    }
    
    const data = await response.json()
    
    console.log('API Response structure:', Object.keys(data))

    // Extract streaming services from the response
    let streamingServices = []
    
    // Check if we have streaming data in the expected format
    if (data?.streamingAvailability?.[country.toLowerCase()]) {
      streamingServices = data.streamingAvailability[country.toLowerCase()]
    } else if (data?.results?.streamingInfo?.[country.toLowerCase()]) {
      // Alternative structure sometimes returned by the API
      streamingServices = data.results.streamingInfo[country.toLowerCase()]
    } else if (Array.isArray(data?.results)) {
      // Yet another possible structure
      streamingServices = data.results
        .filter(item => item.country?.toLowerCase() === country.toLowerCase())
        .map(item => ({
          service: item.platform || item.service,
          link: item.url || item.link,
          available: true
        }))
    }
    
    console.log(`Found ${streamingServices.length} streaming services for movie ${tmdbId}`)

    // Normalize the data structure for consistency
    const normalizedServices = Array.isArray(streamingServices) 
      ? streamingServices.map(service => ({
          service: service.service || service.platform || service.provider || service.name,
          link: service.link || service.url || `https://www.${service.service?.toLowerCase()}.com`,
          available: true,
          type: service.type || 'subscription'
        }))
      : [];
    
    return new Response(
      JSON.stringify({ 
        result: normalizedServices,
        timestamp: new Date().toISOString()
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
        error: error.message,
        result: [] // Always include an empty result array even on error
      }),
      { 
        status: 200, // Use 200 even for errors to prevent client crashing
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
