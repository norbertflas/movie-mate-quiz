
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
    const requestData = await req.json()
    const { searchQuery, searchField = 'name', types = 'movie' } = requestData
    
    if (!searchQuery) {
      throw new Error('searchQuery is required')
    }

    console.log(`Searching Watchmode for: ${searchQuery}, field: ${searchField}, types: ${types}`)

    // Build the search URL
    const params = new URLSearchParams({
      apiKey,
      search_value: searchQuery,
      search_field: searchField,
      types
    })
    
    const url = `https://api.watchmode.com/v1/search/?${params.toString()}`
    
    // Fetch search results from Watchmode API
    const response = await fetch(url)
    const responseData = await response.json()
    
    if (!response.ok) {
      console.error('Watchmode API error:', responseData)
      throw new Error(`Watchmode API error: ${JSON.stringify(responseData)}`)
    }
    
    console.log(`Retrieved ${responseData.title_results?.length || 0} title results from Watchmode`)
    
    // Return the data with CORS headers
    return new Response(
      JSON.stringify({ results: responseData.title_results || [] }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in watchmode-title-search function:', error)
    
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
