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

    // Using the updated Streaming Availability API endpoint
    const url = `https://streaming-availability.p.rapidapi.com/shows/get`
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    }

    // Construct the URL with query parameters
    const queryParams = new URLSearchParams({
      id: `tmdb:${tmdbId}`,
      country: country.toLowerCase(),
      output_language: country.toLowerCase()
    })
    
    const fullUrl = `${url}?${queryParams.toString()}`
    const response = await fetch(fullUrl, options)
    
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

    // Extract streaming services from the response using the updated API structure
    let streamingServices = []
    
    if (data?.streamingOptions && data.streamingOptions[country.toLowerCase()]) {
      const countryStreamingOptions = data.streamingOptions[country.toLowerCase()]
      
      // Extract streaming service information
      streamingServices = countryStreamingOptions.map(option => ({
        service: option.service?.name || '',
        link: option.link || '',
        available: true,
        type: option.type || 'subscription'
      })).filter(service => service.service && service.link)
      
      console.log(`Found ${streamingServices.length} streaming services for movie ${tmdbId}`)
    } else {
      console.log('No streaming info found in response')
    }
    
    return new Response(
      JSON.stringify({ 
        result: streamingServices,
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
