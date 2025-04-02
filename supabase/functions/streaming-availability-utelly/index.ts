
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import axios from 'https://esm.sh/axios@1.6.7'

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
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          result: [],
          error: 'Invalid JSON in request body'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const { title, country = 'us' } = body;

    if (!title) {
      console.error('Missing required parameter: title');
      return new Response(
        JSON.stringify({
          result: [],
          error: 'Missing required parameter: title'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Utelly API key from environment
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY not configured');
      return new Response(
        JSON.stringify({
          result: [],
          error: 'RAPIDAPI_KEY not configured'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log(`Fetching Utelly data for title: "${title}" in country: ${country}`);
    
    const options = {
      method: 'GET',
      url: 'https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/lookup',
      params: {
        term: title,
        country: country.toLowerCase()
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com'
      }
    };

    // Call Utelly API
    const response = await axios.request(options);
    console.log('Utelly API response status:', response.status);
    
    if (!response.data || !response.data.results || !Array.isArray(response.data.results)) {
      console.log('No results found in Utelly API response');
      return new Response(
        JSON.stringify({ result: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract streaming services from response
    const results = response.data.results;
    console.log(`Found ${results.length} results from Utelly API`);
    
    // Format streaming services data
    const streamingServices = [];
    
    if (results.length > 0) {
      // Take the first result (most relevant)
      const firstResult = results[0];
      
      if (firstResult.locations && Array.isArray(firstResult.locations)) {
        console.log(`Found ${firstResult.locations.length} streaming locations`);
        
        firstResult.locations.forEach(location => {
          if (location.display_name && location.url) {
            streamingServices.push({
              service: location.display_name,
              link: location.url,
              available: true,
              type: 'subscription',
              source: 'utelly'
            });
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        result: streamingServices,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in Utelly streaming availability function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        result: []
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
})
