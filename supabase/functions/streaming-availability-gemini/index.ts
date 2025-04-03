import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.0";

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
    // Parse request body
    const { tmdbId, title, country = 'pl' } = await req.json();
    
    // Validate input
    if (!tmdbId && !title) {
      throw new Error('Either tmdbId or title is required');
    }
    
    console.log(`Processing request for tmdbId: ${tmdbId}, title: ${title}, country: ${country}`);
    
    // Get API keys from environment variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    if (!tmdbApiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }
    
    // Get movie details from TMDB if we have the ID
    let movieTitle = title;
    let movieYear = '';
    let movieGenres = [];
    
    if (tmdbId) {
      try {
        const tmdbResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}&language=${country === 'pl' ? 'pl-PL' : 'en-US'}`
        );
        
        if (!tmdbResponse.ok) {
          throw new Error(`TMDB API error: ${tmdbResponse.status}`);
        }
        
        const movieData = await tmdbResponse.json();
        movieTitle = movieData.title || movieTitle;
        movieYear = movieData.release_date ? movieData.release_date.split('-')[0] : '';
        movieGenres = movieData.genres?.map((g: any) => g.name) || [];
        
        console.log(`Found movie: "${movieTitle}" (${movieYear})`);
      } catch (error) {
        console.error('Error fetching movie details from TMDB:', error);
      }
    }
    
    if (!movieTitle) {
      throw new Error('Unable to determine movie title');
    }
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Define streaming services based on country
    const countryStreamingServices = country.toLowerCase() === 'pl' 
      ? 'Netflix, HBO Max, Disney+, Amazon Prime Video, Canal+, Player, SkyShowtime, Apple TV+' 
      : 'Netflix, HBO Max, Disney+, Amazon Prime Video, Hulu, Paramount+, Apple TV+, Peacock';
    
    // Create prompt
    const prompt = `
      I need accurate, up-to-date information about streaming service availability for a movie.
      
      Movie: "${movieTitle}" ${movieYear ? `(${movieYear})` : ''}
      ${movieGenres.length > 0 ? `Genres: ${movieGenres.join(', ')}` : ''}
      Country: ${country.toUpperCase()}
      
      Please tell me which of these streaming services currently offer this movie in ${country.toUpperCase()}: 
      ${countryStreamingServices}
      
      Respond with ONLY a JSON object in this exact format:
      {
        "services": [
          {
            "service": "Netflix",  // Service name exactly as provided in the list above
            "available": true,
            "link": "https://www.netflix.com",  // General service homepage if specific URL unknown
            "type": "subscription"  // Use: subscription, rent, buy, free
          },
          // other services...
        ]
      }
      
      Keep the response brief and focused on current streaming availability data ONLY.
      If uncertain whether a movie is available on a service, do NOT include that service.
      DO NOT include any explanations, headers, or additional text outside the JSON.
    `;
    
    // Generate response from Gemini
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Received response from Gemini API');
    
    // Extract JSON from the response
    let jsonMatch = text.match(/(\{[\s\S]*\})/);
    let jsonStr = jsonMatch ? jsonMatch[0] : '';
    
    if (!jsonStr) {
      jsonStr = text; // Try using the entire response if no JSON pattern found
    }
    
    try {
      const data = JSON.parse(jsonStr);
      
      if (!data.services || !Array.isArray(data.services)) {
        throw new Error('Invalid response format: services array missing');
      }
      
      // Process services to add logos and ensure all fields are present
      const processedServices = data.services.map((service: any) => {
        return {
          service: service.service,
          available: service.available === true,
          link: service.link || getDefaultServiceLink(service.service, country),
          logo: `/streaming-icons/${service.service.toLowerCase().replace(/\s+/g, '')}.svg`,
          type: service.type || 'subscription'
        };
      }).filter((service: any) => service.available); // Only include available services
      
      console.log(`Found ${processedServices.length} streaming services from Gemini AI`);
      
      return new Response(
        JSON.stringify({ 
          services: processedServices,
          source: 'gemini',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
      
    } catch (error) {
      console.error('Error parsing Gemini response:', error, 'Raw response:', text);
      throw new Error('Failed to parse Gemini response');
    }
    
  } catch (error) {
    console.error('Error in streaming-availability-gemini function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        services: []
      }),
      { 
        status: 200, // Use 200 even for errors to avoid client-side crashes
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});

// Helper function to get default service links based on service name and country
function getDefaultServiceLink(serviceName: string, country: string): string {
  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '');
  const isPoland = country.toLowerCase() === 'pl';
  
  const serviceLinks: Record<string, string> = {
    'netflix': isPoland ? 'https://www.netflix.com/pl/' : 'https://www.netflix.com',
    'hbomax': isPoland ? 'https://www.max.com/pl' : 'https://www.max.com',
    'disney+': isPoland ? 'https://www.disneyplus.com/pl' : 'https://www.disneyplus.com',
    'disneyplus': isPoland ? 'https://www.disneyplus.com/pl' : 'https://www.disneyplus.com',
    'amazonprimevideo': isPoland ? 'https://www.primevideo.com/region/eu/' : 'https://www.amazon.com/Prime-Video',
    'primevideo': isPoland ? 'https://www.primevideo.com/region/eu/' : 'https://www.amazon.com/Prime-Video',
    'appletv+': 'https://tv.apple.com',
    'appletvplus': 'https://tv.apple.com',
    'canal+': isPoland ? 'https://www.canalplus.com/pl/' : 'https://www.canalplus.com',
    'canalplus': isPoland ? 'https://www.canalplus.com/pl/' : 'https://www.canalplus.com',
    'player': 'https://player.pl',
    'skyshowtime': isPoland ? 'https://www.skyshowtime.com/pl' : 'https://www.skyshowtime.com',
    'hulu': 'https://www.hulu.com',
    'paramountplus': 'https://www.paramountplus.com',
    'peacock': 'https://www.peacocktv.com'
  };
  
  return serviceLinks[normalizedName] || 'https://www.google.com/search?q=' + encodeURIComponent(`watch ${serviceName} ${country}`);
}
