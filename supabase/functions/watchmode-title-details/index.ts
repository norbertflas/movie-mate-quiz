
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
    const { titleId, region = 'US', includeSources = true } = await req.json()
    
    if (!titleId) {
      throw new Error('titleId is required')
    }

    console.log(`Fetching Watchmode title details for ID: ${titleId}, region: ${region}`)

    // Build the API URL with options
    let url = `https://api.watchmode.com/v1/title/${titleId}/details/?apiKey=${apiKey}`
    
    // Add additional parameters if needed
    const params = new URLSearchParams()
    if (includeSources) {
      params.append('append_to_response', 'sources')
    }
    if (region) {
      params.append('regions', region)
    }
    
    // Append parameters if any were added
    if (params.toString()) {
      url += `&${params.toString()}`
    }
    
    console.log(`Making request to: ${url}`)
    
    // Fetch title details from Watchmode API
    const response = await fetch(url)
    const responseData = await response.json()
    
    if (!response.ok) {
      console.error('Watchmode API error:', responseData)
      throw new Error(`Watchmode API error: ${JSON.stringify(responseData)}`)
    }
    
    // Log sources count if available
    if (responseData.sources) {
      console.log(`Retrieved ${responseData.sources.length} sources from Watchmode`)
    }
    
    // Return the data with CORS headers
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in watchmode-title-details function:', error)
    
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
