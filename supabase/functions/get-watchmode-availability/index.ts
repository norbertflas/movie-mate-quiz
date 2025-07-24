import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  ios_url?: string;
  android_url?: string;
  web_url?: string;
  format: string;
  price?: number;
  seasons?: number[];
  episodes?: number[];
}

interface WatchmodeResponse {
  id: number;
  title: string;
  sources: WatchmodeSource[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tmdbId = url.searchParams.get('tmdb_id');
    const region = url.searchParams.get('region') || 'US';

    if (!tmdbId) {
      return new Response(
        JSON.stringify({ error: 'Missing tmdb_id parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const watchmodeApiKey = Deno.env.get('WATCHMODE_API_KEY');
    if (!watchmodeApiKey) {
      console.error('Watchmode API key not found');
      return new Response(
        JSON.stringify({ error: 'Watchmode API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching Watchmode data for TMDB ID ${tmdbId} in region ${region}`);

    // First, search for the title to get Watchmode ID
    const searchResponse = await fetch(
      `https://api.watchmode.com/v1/search/?apiKey=${watchmodeApiKey}&search_field=tmdb_id&search_value=${tmdbId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!searchResponse.ok) {
      console.error(`Watchmode search API error: ${searchResponse.status}`);
      return new Response(
        JSON.stringify({ error: `Watchmode search API error: ${searchResponse.status}` }),
        { 
          status: searchResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.title_results || searchData.title_results.length === 0) {
      console.log(`No Watchmode results found for TMDB ID ${tmdbId}`);
      return new Response(
        JSON.stringify({ 
          services: [],
          region: region,
          timestamp: new Date().toISOString(),
          source: 'watchmode'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const watchmodeId = searchData.title_results[0].id;
    console.log(`Found Watchmode ID: ${watchmodeId} for TMDB ID: ${tmdbId}`);

    // Now get the sources for this title
    const sourcesResponse = await fetch(
      `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${watchmodeApiKey}&regions=${region}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!sourcesResponse.ok) {
      console.error(`Watchmode sources API error: ${sourcesResponse.status}`);
      return new Response(
        JSON.stringify({ error: `Watchmode sources API error: ${sourcesResponse.status}` }),
        { 
          status: sourcesResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const sourcesData = await sourcesResponse.json();
    
    if (!sourcesData || !Array.isArray(sourcesData)) {
      console.log(`No sources found for Watchmode ID ${watchmodeId}`);
      return new Response(
        JSON.stringify({ 
          services: [],
          region: region,
          timestamp: new Date().toISOString(),
          source: 'watchmode'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${sourcesData.length} sources from Watchmode`);

    // Transform Watchmode data to our format
    const services = sourcesData.map((source: WatchmodeSource) => {
      let type = 'subscription';
      
      // Determine availability type based on format
      switch (source.format.toLowerCase()) {
        case 'subscription':
          type = 'subscription';
          break;
        case 'rent':
        case 'rental':
          type = 'rent';
          break;
        case 'purchase':
        case 'buy':
          type = 'buy';
          break;
        case 'free':
          type = 'subscription'; // Free is treated as subscription
          break;
        default:
          type = 'subscription';
      }

      return {
        service: source.name,
        available: true,
        type: type,
        link: source.web_url || source.ios_url || source.android_url || '#',
        logo: '', // Watchmode doesn't provide logos, will use fallback
        price: source.price,
        source_id: source.source_id,
        format: source.format,
        region: source.region
      };
    });

    // Remove duplicates by service name
    const uniqueServices = services.filter((service, index, self) => 
      index === self.findIndex(s => s.service === service.service && s.type === service.type)
    );

    const result = {
      services: uniqueServices,
      region: region,
      timestamp: new Date().toISOString(),
      source: 'watchmode',
      watchmode_id: watchmodeId,
      tmdb_id: parseInt(tmdbId)
    };

    console.log(`Returning ${uniqueServices.length} unique streaming services from Watchmode`);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-watchmode-availability:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});