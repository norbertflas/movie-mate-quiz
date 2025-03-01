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
    const { titleId, region = 'US', includeSources = true } = await req.json();

    if (!titleId) {
      return new Response(
        JSON.stringify({ error: "Missing titleId parameter" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Fetching Watchmode title details for ID ${titleId} in region ${region}`);

    // Build URL for title details
    const titleUrl = `https://api.watchmode.com/v1/title/${titleId}/details/?apiKey=${WATCHMODE_API_KEY}&append_to_response=${includeSources ? 'sources' : ''}&region=${region}`;
    
    console.log(`Making request to: ${titleUrl.replace(WATCHMODE_API_KEY, "[REDACTED]")}`);
    
    const response = await fetch(titleUrl);

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
      
      if (response.status === 404) {
        console.log(`No Watchmode data found for title ID: ${titleId}`);
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
    
    // Filter sources to only include the requested region
    if (data.sources && Array.isArray(data.sources)) {
      data.sources = data.sources.filter((source: any) => source.region === region);
      console.log(`Found ${data.sources.length} sources for region ${region}`);
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in watchmode-title-details function:", error);
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