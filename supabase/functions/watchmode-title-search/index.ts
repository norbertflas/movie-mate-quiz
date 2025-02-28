
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

    const { searchQuery, searchField = 'name', types = 'movie,tv_series' } = requestData;

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Missing searchQuery parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct the API URL
    const url = new URL(`${WATCHMODE_API_BASE}/search/`);
    url.searchParams.append('apiKey', watchmodeApiKey);
    url.searchParams.append('search_field', searchField);
    url.searchParams.append('search_value', searchQuery);
    url.searchParams.append('types', types);

    console.log(`Searching Watchmode for: ${searchQuery} (field: ${searchField})`);

    // Call the Watchmode API
    const response = await fetch(url.toString());
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Watchmode API error:', responseData);
      throw new Error(`Watchmode API error: ${JSON.stringify(responseData)}`);
    }

    // Return the title results
    return new Response(
      JSON.stringify({
        results: responseData.title_results || [],
        total: responseData.title_results?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in watchmode-title-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
