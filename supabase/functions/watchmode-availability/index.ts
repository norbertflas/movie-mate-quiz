import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WATCHMODE_API_KEY = Deno.env.get("WATCHMODE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Check if API key is configured
    if (!WATCHMODE_API_KEY) {
      console.error("WATCHMODE_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "Watchmode API key not configured",
          status: 500 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Test połączenia z Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('_dummy_query')
      .select('count')
      .limit(1)
      .single();

    if (connectionError) {
      console.error('Błąd połączenia z Supabase:', connectionError);
      return new Response(
        JSON.stringify({ 
          error: 'Database connection error',
          details: connectionError.message 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Parse request body
    const { tmdbId } = await req.json();

    if (!tmdbId) {
      return new Response(
        JSON.stringify({ error: "Missing tmdbId parameter" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Looking up WatchMode data for TMDB ID: ${tmdbId}`);

    // Always use US region for reliable data with free API
    const titleSearchUrl = `https://api.watchmode.com/v1/title/tmdb_${tmdbId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=US`;
    
    console.log(`Making request to Watchmode API...`);
    
    const response = await fetch(titleSearchUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Watchmode API error: ${response.status} ${response.statusText}`);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "60");
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded", 
            status: 429,
            retryAfter
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429 
          }
        );
      }
      
      if (response.status === 404) {
        console.log(`No Watchmode data found for TMDB ID: ${tmdbId}`);
        return new Response(
          JSON.stringify({ sources: [] }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }
      
      throw new Error(`Watchmode API error: ${response.status}`);
    }

    const data = await response.json();

    // Validate and clean up the response data
    const sources = Array.isArray(data) ? data.filter(source => 
      source && 
      source.type && 
      ['sub', 'free', 'tvod', 'addon', 'purchase', 'live'].includes(source.type.toLowerCase()) &&
      source.name &&
      source.source_id
    ) : [];
    
    console.log(`Received and filtered ${sources.length} valid sources from Watchmode`);

    return new Response(
      JSON.stringify({ 
        sources,
        region: 'US',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in watchmode-availability function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        status: 500 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
