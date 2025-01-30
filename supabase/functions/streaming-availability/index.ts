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

    console.log(`Fetching streaming availability for movie: ${tmdbId}`)

    const url = `https://movies-tv-shows-database.p.rapidapi.com/movie/id/${tmdbId}`
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'movies-tv-shows-database.p.rapidapi.com',
        'Type': 'get-movie-details'
      }
    }

    const response = await fetch(url, options)
    const data = await response.json()
    
    console.log('API Response:', data)

    // Extract streaming services from the response
    const streamingServices = data?.streamingAvailability?.[country] || []
    
    console.log('Streaming services found:', streamingServices)

    return new Response(
      JSON.stringify({ result: streamingServices }),
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
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})