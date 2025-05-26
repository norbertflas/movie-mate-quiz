
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapowanie krajów na kody ISO
const COUNTRY_CODES = {
  'poland': 'PL',
  'polska': 'PL', 
  'pl': 'PL',
  'us': 'US',
  'usa': 'US',
  'united-states': 'US'
};

// Mapowanie serwisów streamingowych z obsługą regionów
function normalizeServiceName(serviceName: string, region: string = 'US'): string {
  if (!serviceName) return 'Unknown';
  
  const serviceMap: Record<string, Record<string, string>> = {
    'US': {
      'netflix': 'Netflix',
      'prime': 'Amazon Prime Video', 
      'disney': 'Disney+',
      'hulu': 'Hulu',
      'hbo': 'HBO Max',
      'apple': 'Apple TV+',
      'paramount': 'Paramount+',
      'peacock': 'Peacock',
      'showtime': 'Showtime',
      'starz': 'Starz'
    },
    'PL': {
      'netflix': 'Netflix',
      'prime': 'Amazon Prime Video',
      'disney': 'Disney+',
      'hbo': 'HBO Max', 
      'apple': 'Apple TV+',
      'canalplus': 'Canal+',
      'player': 'Player.pl',
      'tvp': 'TVP VOD',
      'polsat': 'Polsat Box Go',
      'nc': 'nc+'
    }
  };
  
  const normalized = serviceName.toLowerCase().trim();
  const regionMap = serviceMap[region] || serviceMap['US'];
  return regionMap[normalized] || serviceName;
}

// Generowanie domyślnych linków
function generateDefaultLink(serviceName: string): string {
  const linkMap: Record<string, string> = {
    'netflix': 'https://www.netflix.com',
    'prime': 'https://www.amazon.com/prime-video',
    'disney': 'https://www.disneyplus.com',
    'hulu': 'https://www.hulu.com',
    'hbo': 'https://www.hbomax.com',
    'apple': 'https://tv.apple.com',
    'paramount': 'https://www.paramountplus.com',
    'canalplus': 'https://www.canalplus.com',
    'player': 'https://player.pl',
    'tvp': 'https://vod.tvp.pl',
    'polsat': 'https://polsatboxgo.pl',
    'nc': 'https://ncplus.pl'
  };
  
  const key = serviceName?.toLowerCase() || '';
  return linkMap[key] || '#';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tmdbId, country = 'us', title, year } = await req.json()
    const watchmodeKey = Deno.env.get('WATCHMODE_API_KEY')
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    
    // Normalizuj kod kraju
    const normalizedCountry = COUNTRY_CODES[country.toLowerCase()] || country.toUpperCase();
    console.log(`Fetching for TMDB ID: ${tmdbId}, Country: ${normalizedCountry}`);

    let streamingServices = []
    let apiError = null
    
    // STRATEGIA 1: Użyj Watchmode API (lepsze dla międzynarodowych regionów)
    if (watchmodeKey) {
      try {
        console.log('Trying Watchmode API...');
        
        // Najpierw znajdź film w Watchmode po TMDB ID
        const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${watchmodeKey}&search_field=tmdb_id&search_value=${tmdbId}`;
        const searchResponse = await fetch(searchUrl);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.title_results && searchData.title_results.length > 0) {
            const watchmodeId = searchData.title_results[0].id;
            
            // Pobierz szczegóły streamingu dla znalezionego filmu
            const detailsUrl = `https://api.watchmode.com/v1/title/${watchmodeId}/details/?apiKey=${watchmodeKey}&append_to_response=sources`;
            const detailsResponse = await fetch(detailsUrl);
            
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              
              if (detailsData.sources) {
                // Filtruj źródła dla wybranego regionu
                const regionSources = detailsData.sources.filter(source => 
                  source.region === normalizedCountry && 
                  (source.type === 'sub' || source.type === 'free' || source.type === 'buy' || source.type === 'rent')
                );
                
                streamingServices = regionSources.map(source => ({
                  service: normalizeServiceName(source.name, normalizedCountry),
                  link: source.web_url || generateDefaultLink(source.name),
                  available: true,
                  type: source.type === 'sub' ? 'subscription' : source.type,
                  source: 'watchmode',
                  quality: 'hd',
                  price: source.price || null,
                  region: normalizedCountry
                }));
                
                console.log(`Watchmode found ${streamingServices.length} services`);
              }
            }
          }
        }
      } catch (watchmodeError) {
        console.log('Watchmode API error:', watchmodeError.message);
      }
    }
    
    // STRATEGIA 2: Użyj Streaming Availability API jako fallback
    if (streamingServices.length === 0 && rapidApiKey) {
      try {
        console.log('Trying Streaming Availability API v4...');
        
        const endpoints = [
          {
            name: 'v4-show-direct',
            url: `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}`,
            params: { country: normalizedCountry.toLowerCase() }
          },
          {
            name: 'v4-search-title', 
            url: 'https://streaming-availability.p.rapidapi.com/shows/search/title',
            params: {
              country: normalizedCountry.toLowerCase(),
              title: title || '',
              show_type: 'movie',
              output_language: 'en'
            }
          }
        ];
        
        if (year && endpoints[1]) {
          endpoints[1].params.year = year;
        }
        
        for (const endpoint of endpoints) {
          if (endpoint.name === 'v4-search-title' && !title) continue;
          
          const queryParams = new URLSearchParams();
          Object.entries(endpoint.params).forEach(([key, value]) => {
            if (value) queryParams.set(key, String(value));
          });
          
          const fullUrl = `${endpoint.url}?${queryParams.toString()}`;
          console.log(`Trying ${endpoint.name}: ${fullUrl}`);
          
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            let shows = [];
            if (endpoint.name === 'v4-show-direct' && data) {
              shows = [data];
            } else if (data && Array.isArray(data)) {
              shows = data;
            } else if (data && data.shows && Array.isArray(data.shows)) {
              shows = data.shows;
            }
            
            if (shows.length > 0) {
              const show = shows[0];
              const countryKey = normalizedCountry.toLowerCase();
              
              if (show.streamingOptions && show.streamingOptions[countryKey]) {
                streamingServices = show.streamingOptions[countryKey].map(option => ({
                  service: normalizeServiceName(option.service?.name || option.service?.id, normalizedCountry),
                  link: option.link || generateDefaultLink(option.service?.name || option.service?.id),
                  available: true,
                  type: option.type || 'subscription',
                  source: endpoint.name,
                  quality: option.quality || 'hd',
                  price: option.price ? `${option.price.amount} ${option.price.currency}` : null,
                  region: normalizedCountry
                })).filter(service => 
                  service.service && 
                  service.service !== 'Unknown' && 
                  service.service !== 'unknown'
                );
                
                console.log(`Found ${streamingServices.length} services via ${endpoint.name}`);
                break;
              }
            }
          } else {
            const errorText = await response.text();
            console.log(`${endpoint.name} failed: ${response.status} - ${errorText}`);
            apiError = `${response.status} ${response.statusText}`;
          }
        }
      } catch (rapidError) {
        console.log('RapidAPI error:', rapidError.message);
        apiError = rapidError.message;
      }
    }
    
    // Usuń duplikaty
    const uniqueServices = streamingServices.reduce((acc, current) => {
      const existing = acc.find(item => item.service === current.service);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return new Response(
      JSON.stringify({
        result: uniqueServices,
        timestamp: new Date().toISOString(),
        region: normalizedCountry,
        tmdbId: tmdbId,
        totalFound: uniqueServices.length,
        source: uniqueServices.length > 0 ? uniqueServices[0].source : 'not-found',
        apiError: uniqueServices.length === 0 ? apiError : null
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        result: [],
        region: 'unknown',
        source: 'error'
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
