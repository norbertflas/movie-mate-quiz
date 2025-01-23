import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils.ts";
import { cleanAnswers, formatAnswersForPrompt } from "./utils.ts";
import { getMovieRecommendations } from "./aiService.ts";
import { getMovieDetails } from "./movieService.ts";
import type { RequestData, MovieRecommendation } from "./types.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!TMDB_API_KEY || !GEMINI_API_KEY) {
      throw new Error('Missing required API keys');
    }

    const requestData: RequestData = await req.json();
    console.log('Raw request data:', requestData);

    if (!requestData?.answers || !Array.isArray(requestData.answers)) {
      throw new Error('Invalid request format: answers array must be provided');
    }

    const cleanedAnswers = cleanAnswers(requestData.answers);
    console.log('Cleaned answers:', cleanedAnswers);

    const formattedAnswers = formatAnswersForPrompt(cleanedAnswers);
    console.log('Formatted answers for Gemini:', formattedAnswers);

    const movieIds = await getMovieRecommendations(formattedAnswers, GEMINI_API_KEY);
    
    const movieDetailsPromises = movieIds.map(id => getMovieDetails(id, TMDB_API_KEY));
    const movies = (await Promise.all(movieDetailsPromises))
      .filter((movie): movie is MovieRecommendation => movie !== null)
      .slice(0, 6);

    if (!movies || movies.length === 0) {
      throw new Error('No valid movies found');
    }

    console.log('Successfully processed movies:', movies.length);
    
    return new Response(JSON.stringify(movies), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in get-personalized-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});