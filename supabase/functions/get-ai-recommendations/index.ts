
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
}

async function searchTMDBMovie(title: string, apiKey: string, language: string): Promise<TMDBMovie | null> {
  try {
    // First search for the movie
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=${language}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.results?.[0]?.id) {
      console.warn(`No movie found for title: ${title}`);
      return null;
    }

    // Then get detailed movie information
    const movieId = searchData.results[0].id;
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=${language}&append_to_response=credits,images`;
    const detailsResponse = await fetch(detailsUrl);
    const movieDetails = await detailsResponse.json();

    return movieDetails;
  } catch (error) {
    console.error(`Error fetching movie data for ${title}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, filters, language = 'en' } = await req.json();
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const tmdbKey = Deno.env.get('TMDB_API_KEY');
    
    if (!geminiKey || !tmdbKey) {
      throw new Error('API keys not configured');
    }

    console.log('Processing request with prompt:', prompt);
    console.log('Filters:', filters);
    console.log('Language:', language);

    // Format the system prompt based on language
    const systemPrompt = language === 'pl' 
      ? `Działaj jako ekspert od rekomendacji filmowych. Na podstawie prośby użytkownika: "${prompt}" i uwzględniając te filtry: ${JSON.stringify(filters)}, zarekomenduj dokładnie 6 filmów, które najlepiej pasują do preferencji.

Dla każdego filmu podaj:
1. Dokładny tytuł filmu
2. Jasne wyjaśnienie, dlaczego pasuje do preferencji

Ustrukturyzuj swoją odpowiedź jako prawidłowy obiekt JSON w tym formacie:
{
  "recommendations": [
    {
      "title": "Dokładny tytuł filmu",
      "reason": "Jasne wyjaśnienie, dlaczego ten film pasuje do preferencji"
    }
  ]
}

Ważne:
- Zarekomenduj dokładnie 6 filmów
- Upewnij się, że JSON jest prawidłowy
- Każdy film musi mieć zarówno tytuł jak i powód
- Trzymaj wyjaśnienia zwięzłe, ale informatywne
- Użyj dokładnego oficjalnego tytułu filmu dla dokładnego dopasowania`
      : `Act as a movie recommendation expert. Based on the user's request: "${prompt}" and considering these filters: ${JSON.stringify(filters)}, recommend exactly 6 movies that best match their preferences.

For each movie, provide:
1. The exact movie title
2. A clear explanation of why it matches their preferences

Structure your response as a valid JSON object like this:
{
  "recommendations": [
    {
      "title": "Exact Movie Title",
      "reason": "Clear explanation of why this movie matches their preferences"
    }
  ]
}

Important:
- Recommend exactly 6 movies
- Make sure the JSON is valid
- Each movie must have both a title and reason
- Keep the reasons concise but informative
- Use the exact official movie title for accurate matching`;

    const requestUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`;
    
    // Call Gemini API
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error status:', response.status);
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API raw response:', JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Extracted response text:', responseText);

    try {
      const parsedRecommendations = JSON.parse(responseText);
      
      if (!Array.isArray(parsedRecommendations.recommendations) || 
          parsedRecommendations.recommendations.length !== 6) {
        throw new Error('Invalid recommendations format');
      }

      // Validate and enrich recommendations with TMDB data
      const enrichedRecommendations = await Promise.all(
        parsedRecommendations.recommendations.map(async (rec: any) => {
          if (!rec.title || !rec.reason) {
            throw new Error('Missing title or reason in recommendation');
          }

          const movieData = await searchTMDBMovie(rec.title, tmdbKey, language);
          if (!movieData) {
            console.warn(`No TMDB data found for movie: ${rec.title}`);
            return {
              ...rec,
              poster_path: null,
              backdrop_path: null,
              overview: rec.reason,
              release_date: null,
              vote_average: null,
              id: null,
              genres: []
            };
          }

          return {
            title: movieData.title,
            reason: rec.reason,
            poster_path: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
            backdrop_path: movieData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}` : null,
            overview: movieData.overview,
            release_date: movieData.release_date,
            vote_average: movieData.vote_average,
            id: movieData.id,
            genres: movieData.genres || []
          };
        })
      );

      return new Response(
        JSON.stringify({ recommendations: enrichedRecommendations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error processing recommendations:', parseError);
      console.error('Raw response text:', responseText);
      throw new Error('Failed to process movie recommendations');
    }
  } catch (error) {
    console.error('Error in get-ai-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
