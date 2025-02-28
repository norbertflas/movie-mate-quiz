
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const WATCHMODE_API_BASE = 'https://api.watchmode.com/v1';

// CORS headers for the response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Watchmode API key from environment
    const watchmodeApiKey = Deno.env.get('WATCHMODE_API_KEY');
    if (!watchmodeApiKey) {
      throw new Error('WATCHMODE_API_KEY environment variable is not set');
    }

    // Parse the JSON request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tmdbId, region = 'US' } = requestData;

    if (!tmdbId) {
      return new Response(
        JSON.stringify({ error: 'Missing tmdbId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing Watchmode request for TMDB ID: ${tmdbId}, region: ${region}`);

    // 1. First, get the Watchmode ID for the TMDB ID
    const idMappingUrl = new URL(`${WATCHMODE_API_BASE}/lookup/`);
    idMappingUrl.searchParams.append('apiKey', watchmodeApiKey);
    idMappingUrl.searchParams.append('source_id', tmdbId.toString());
    idMappingUrl.searchParams.append('source', 'tmdb');

    console.log(`Looking up Watchmode ID for TMDB ID: ${tmdbId}`);
    
    const mappingResponse = await fetch(idMappingUrl.toString());
    const mappingData = await mappingResponse.json();
    
    if (!mappingResponse.ok) {
      console.error('Watchmode ID mapping error:', mappingData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to find Watchmode ID',
          details: mappingData,
          sources: []
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const watchmodeId = mappingData.id;
    if (!watchmodeId) {
      console.log(`No Watchmode ID found for TMDB ID: ${tmdbId}`);
      return new Response(
        JSON.stringify({ sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Now, get the title details and sources
    const detailsUrl = new URL(`${WATCHMODE_API_BASE}/title/${watchmodeId}/details/`);
    detailsUrl.searchParams.append('apiKey', watchmodeApiKey);
    detailsUrl.searchParams.append('append_to_response', 'sources');
    if (region) {
      detailsUrl.searchParams.append('regions', region);
    }

    console.log(`Fetching details for Watchmode ID: ${watchmodeId}`);
    
    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = await detailsResponse.json();

    if (!detailsResponse.ok) {
      console.error('Watchmode details error:', detailsData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve details',
          details: detailsData,
          sources: []
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the formatted response
    return new Response(
      JSON.stringify({
        id: detailsData.id,
        title: detailsData.title,
        type: detailsData.type,
        sources: detailsData.sources || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in watchmode-availability function:', error);
    return new Response(
      JSON.stringify({ error: error.message, sources: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
