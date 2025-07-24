import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

interface RegionWatchProviders {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

interface TMDBWatchProvidersResponse {
  id: number;
  results: Record<string, RegionWatchProviders>;
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

    const tmdbApiKey = Deno.env.get('TMDB_API_KEY');
    if (!tmdbApiKey) {
      console.error('TMDB API key not found');
      return new Response(
        JSON.stringify({ error: 'TMDB API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching watch providers for movie ${tmdbId} in region ${region}`);

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${tmdbApiKey}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `TMDB API error: ${response.status}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data: TMDBWatchProvidersResponse = await response.json();
    console.log(`Successfully fetched watch providers for movie ${tmdbId}`);

    // Transform the data to our format
    const regionData = data.results[region.toUpperCase()];
    
    if (!regionData) {
      console.log(`No watch providers found for region ${region}`);
      return new Response(
        JSON.stringify({ 
          services: [],
          region: region,
          timestamp: new Date().toISOString(),
          source: 'tmdb'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const services = [];

    // Add subscription services
    if (regionData.flatrate) {
      for (const provider of regionData.flatrate) {
        services.push({
          service: provider.provider_name,
          available: true,
          type: 'subscription',
          link: regionData.link,
          logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          priority: provider.display_priority,
          provider_id: provider.provider_id
        });
      }
    }

    // Add rental services
    if (regionData.rent) {
      for (const provider of regionData.rent) {
        services.push({
          service: provider.provider_name,
          available: true,
          type: 'rent',
          link: regionData.link,
          logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          priority: provider.display_priority,
          provider_id: provider.provider_id
        });
      }
    }

    // Add purchase services
    if (regionData.buy) {
      for (const provider of regionData.buy) {
        services.push({
          service: provider.provider_name,
          available: true,
          type: 'buy',
          link: regionData.link,
          logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          priority: provider.display_priority,
          provider_id: provider.provider_id
        });
      }
    }

    // Sort by priority
    services.sort((a, b) => a.priority - b.priority);

    const result = {
      services,
      region: region,
      timestamp: new Date().toISOString(),
      source: 'tmdb',
      tmdb_id: parseInt(tmdbId)
    };

    console.log(`Returning ${services.length} streaming services for ${region}`);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-tmdb-watch-providers:', error);
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