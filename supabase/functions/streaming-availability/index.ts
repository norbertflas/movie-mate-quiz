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
    const { tmdbId, country = 'us', services } = await req.json()
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY not configured')
      throw new Error('RAPIDAPI_KEY not configured')
    }

    const baseUrl = 'https://streaming-availability.p.rapidapi.com/v2'
    const headers = {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
      'Content-Type': 'application/json',
    }

    let url: string
    let options: RequestInit = { headers }

    if (tmdbId) {
      url = `${baseUrl}/get/basic/tmdb/movie/${tmdbId}`
      console.log('Fetching streaming availability for movie:', tmdbId)
    } else if (services) {
      url = `${baseUrl}/search/basic`
      options = {
        ...options,
        method: 'POST',
        body: JSON.stringify({
          services,
          country,
          output_language: 'en',
          show_type: 'movie',
          order_by: 'popularity'
        })
      }
      console.log('Searching movies by streaming services:', services)
    } else {
      throw new Error('Invalid request parameters')
    }

    const response = await fetch(url, options)
    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in streaming-availability function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})