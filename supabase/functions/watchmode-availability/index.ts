
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the Watchmode API key from environment variables
    const apiKey = Deno.env.get('WATCHMODE_API_KEY')
    if (!apiKey) {
      throw new Error('WATCHMODE_API_KEY not found')
    }

    // Parse the request body
    const { tmdbId, region = 'US' } = await req.json()
    
    if (!tmdbId) {
      throw new Error('tmdbId is required')
    }

    console.log(`Fetching Watchmode data for TMDB ID: ${tmdbId}, region: ${region}`)

    // Format the endpoint URL correctly using TMDB ID format
    // The Watchmode API documentation shows that TMDB IDs can be used
    // with format "movie-{tmdbId}" or "tv-{tmdbId}"
    // We'll assume it's a movie for now, but this could be enhanced with a mediaType parameter
    const formattedId = `movie-${tmdbId}`
    
    // Build the API URL to retrieve sources
    const url = `https://api.watchmode.com/v1/title/${formattedId}/sources/?apiKey=${apiKey}&regions=${region}`
    
    console.log(`Making request to: ${url}`)
    
    // Fetch streaming sources from Watchmode API
    const response = await fetch(url)
    const responseData = await response.json()
    
    if (!response.ok) {
      console.error('Watchmode API error:', responseData)
      throw new Error(`Watchmode API error: ${JSON.stringify(responseData)}`)
    }
    
    console.log(`Retrieved ${Array.isArray(responseData) ? responseData.length : 0} sources from Watchmode`)
    
    // Return the data with CORS headers
    return new Response(
      JSON.stringify({ sources: responseData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in watchmode-availability function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
