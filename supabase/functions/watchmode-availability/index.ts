
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body carefully with error handling
    let reqBody;
    try {
      const text = await req.text();
      console.log("Request body text:", text);
      
      if (!text) {
        throw new Error("Empty request body");
      }
      
      reqBody = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body: ' + e.message }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    const { tmdbId, region = 'US' } = reqBody;

    if (!tmdbId) {
      return new Response(
        JSON.stringify({ error: 'TMDB ID is required' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    const watchmodeApiKey = Deno.env.get('WATCHMODE_API_KEY');
    
    if (!watchmodeApiKey) {
      console.error('WATCHMODE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    console.log(`Fetching Watchmode availability for movie: ${tmdbId}, region: ${region}`);

    // First, get the Watchmode title ID from TMDB ID
    const titleIdUrl = `https://api.watchmode.com/v1/title/tmdb_${tmdbId}/details/?apiKey=${watchmodeApiKey}&append_to_response=sources`;
    
    console.log('Requesting Watchmode title ID');
    const titleResponse = await fetch(titleIdUrl);
    
    if (!titleResponse.ok) {
      const errorText = await titleResponse.text();
      console.error('Watchmode API error response:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Watchmode API error: ${titleResponse.status} ${titleResponse.statusText}`,
          details: errorText
        }),
        { 
          status: titleResponse.status,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }
    
    const titleData = await titleResponse.json();
    console.log('Watchmode title data received:', { id: titleData.id, title: titleData.title });
    
    // Return sources directly if they were included in the response
    if (titleData.sources && Array.isArray(titleData.sources)) {
      const filteredSources = titleData.sources.filter(source => 
        source.region === region || source.region === region.toUpperCase()
      );
      
      console.log(`Found ${filteredSources.length} sources for region ${region}`);
      
      return new Response(
        JSON.stringify({ 
          sources: filteredSources,
          title: titleData.title,
          id: titleData.id
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }
    
    // If sources weren't included, fetch them separately
    const sourcesUrl = `https://api.watchmode.com/v1/title/${titleData.id}/sources/?apiKey=${watchmodeApiKey}&regions=${region}`;
    
    console.log('Requesting sources for Watchmode title ID:', titleData.id);
    const sourcesResponse = await fetch(sourcesUrl);
    
    if (!sourcesResponse.ok) {
      const errorText = await sourcesResponse.text();
      console.error('Watchmode sources API error response:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Watchmode API error: ${sourcesResponse.status} ${sourcesResponse.statusText}`,
          details: errorText
        }),
        { 
          status: sourcesResponse.status,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }
    
    const sources = await sourcesResponse.json();
    console.log(`Found ${sources.length} sources for region ${region}`);
    
    return new Response(
      JSON.stringify({ 
        sources,
        title: titleData.title,
        id: titleData.id
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in watchmode-availability function:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
