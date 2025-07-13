
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
          error: "Watchmode API key not configured",
          status: 500 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Parse request body
    const { searchQuery, searchField = 'name', types = 'movie,tv_series', region = 'US' } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: "Missing searchQuery parameter" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Searching Watchmode titles with query: ${searchQuery} in region: ${region}`);

    // Build search URL
    const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_field=${searchField}&search_value=${encodeURIComponent(searchQuery)}&types=${types}&regions=${region}`;
    
    console.log(`Making request to: ${searchUrl.replace(WATCHMODE_API_KEY, "[REDACTED]")}`);
    
    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error(`Watchmode API error: ${response.status} ${response.statusText}`);
      
      // Check for specific error types
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded", 
            status: 429,
            retryAfter: parseInt(response.headers.get("retry-after") || "60")
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Watchmode API error: ${response.status}`,
          status: response.status 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const data = await response.json();
    console.log(`Received ${data.title_results?.length || 0} results from Watchmode for region ${region}`);

    return new Response(
      JSON.stringify({ results: data.title_results || [] }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in watchmode-title-search function:", error);
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
