
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
    const { tmdbId, region = 'US' } = await req.json()
    const watchmodeApiKey = Deno.env.get('WATCHMODE_API_KEY')
    
    if (!watchmodeApiKey) {
      console.error('WATCHMODE_API_KEY not configured')
      throw new Error('WATCHMODE_API_KEY not configured')
    }

    console.log(`Fetching Watchmode availability for movie: ${tmdbId}, region: ${region}`)

    // First, get the Watchmode title ID from TMDB ID
    const titleIdUrl = `https://api.watchmode.com/v1/title/tmdb_${tmdbId}/details/?apiKey=${watchmodeApiKey}&append_to_response=sources`
    
    console.log('Requesting Watchmode title ID')
    const titleResponse = await fetch(titleIdUrl)
    
    if (!titleResponse.ok) {
      throw new Error(`Watchmode API error: ${titleResponse.status} ${titleResponse.statusText}`)
    }
    
    const titleData = await titleResponse.json()
    console.log('Watchmode title data received:', { id: titleData.id, title: titleData.title })
    
    // Return sources directly if they were included in the response
    if (titleData.sources && Array.isArray(titleData.sources)) {
      const filteredSources = titleData.sources.filter(source => 
        source.region === region || source.region === region.toUpperCase()
      )
      
      console.log(`Found ${filteredSources.length} sources for region ${region}`)
      
      return new Response(
        JSON.stringify({ 
          id: titleData.id, 
          title: titleData.title,
          sources: filteredSources 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )
    }
    
    // If sources weren't included, fetch them separately
    const sourcesUrl = `https://api.watchmode.com/v1/title/${titleData.id}/sources/?apiKey=${watchmodeApiKey}&regions=${region}`
    
    console.log('Requesting sources for Watchmode title ID:', titleData.id)
    const sourcesResponse = await fetch(sourcesUrl)
    
    if (!sourcesResponse.ok) {
      throw new Error(`Watchmode API error: ${sourcesResponse.status} ${sourcesResponse.statusText}`)
    }
    
    const sources = await sourcesResponse.json()
    console.log(`Found ${sources.length} sources for region ${region}`)
    
    return new Response(
      JSON.stringify({ 
        id: titleData.id,
        title: titleData.title,
        sources 
      }),
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
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
