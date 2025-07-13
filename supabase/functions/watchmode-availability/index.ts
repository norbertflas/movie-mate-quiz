
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WATCHMODE_API_KEY = Deno.env.get("WATCHMODE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? 
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
          sources: [],
          error: "Watchmode API key not configured",
          status: 200 // Using 200 instead of 500 to avoid errors in frontend
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // Check Supabase connection
    if (!supabase) {
      console.error('Supabase client could not be initialized - missing URL or key');
      return new Response(
        JSON.stringify({ 
          sources: [],
          error: 'Database connection error: missing configuration',
          status: 200
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // Parse request body
    let tmdbId;
    try {
      const body = await req.json();
      tmdbId = body.tmdbId;
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ 
          sources: [],
          error: "Invalid request format",
          status: 200
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    if (!tmdbId) {
      return new Response(
        JSON.stringify({ 
          sources: [],
          error: "Missing tmdbId parameter"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    console.log(`Looking up WatchMode data for TMDB ID: ${tmdbId}`);

    try {
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
              sources: [],
              error: "Rate limit exceeded", 
              retryAfter
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200
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
        
        return new Response(
          JSON.stringify({ 
            sources: [],
            error: `Watchmode API error: ${response.status}`
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
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
    } catch (fetchError) {
      console.error('Fetch error with Watchmode API:', fetchError);
      return new Response(
        JSON.stringify({ 
          sources: [],
          error: `API fetch error: ${fetchError.message}`
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error("Error in watchmode-availability function:", error);
    return new Response(
      JSON.stringify({ 
        sources: [],
        error: error.message || "Unknown error"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  }
});
