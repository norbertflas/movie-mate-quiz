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

    // Parse request body for tmdbId and region
    const { tmdbId, region = 'US' } = await req.json();

    if (!tmdbId) {
      return new Response(
        JSON.stringify({ error: "Missing tmdbId parameter" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Looking up WatchMode data for TMDB ID: ${tmdbId} in region: ${region}`);

    // First query the Watchmode title_id from their database using the TMDB ID
    const titleSearchUrl = `https://api.watchmode.com/v1/title/tmdb_${tmdbId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=${region}`;
    
    console.log(`Making request to: ${titleSearchUrl.replace(WATCHMODE_API_KEY, "[REDACTED]")}`);
    
    let response;
    let retries = 3;

    // Retry logic for transient errors
    while (retries > 0) {
      try {
        response = await fetch(titleSearchUrl);
        if (response.ok) break; // Exit loop if request is successful
        console.error(`Watchmode API error: ${response.status} ${response.statusText}`);
      } catch (fetchError) {
        console.error(`Network error while fetching Watchmode data: ${fetchError.message}`);
      }
      retries--;
      console.log(`Retrying... (${3 - retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
    }

    if (!response || !response.ok) {
      const status = response?.status || 500;
      const statusText = response?.statusText || "Unknown error";
      console.error(`Failed to fetch Watchmode data after retries. Status: ${status} ${statusText}`);

      // Handle specific error types
      if (status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded", 
            status: 429,
            retryAfter: parseInt(response?.headers?.get("retry-after") || "60")
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429 
          }
        );
      }

      if (status === 404) {
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
          error: `Watchmode API error: ${status} ${statusText}`,
          status 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    let data;
    try {
      data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected an array of sources");
      }
      console.log(`Received ${data.length || 0} sources from Watchmode`);
    } catch (parseError) {
      console.error(`Error parsing Watchmode API response: ${parseError.message}`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse Watchmode API response",
          status: 500 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify(data.length ? { sources: data } : { sources: [] }),
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