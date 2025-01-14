import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tmdbId, country = 'us', services } = await req.json()
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    
    if (!rapidApiKey) {
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})