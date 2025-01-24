import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils.ts";
import { cleanAnswers, formatAnswersForPrompt, getGenreId } from "./utils.ts";
import { getMovieRecommendations } from "./aiService.ts";
import { getMovieDetails, getMoviesByGenre } from "./movieService.ts";
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

    // Find the genre answer
    const genreAnswer = cleanedAnswers.find(answer => answer.questionId === 'genre');
    if (!genreAnswer) {
      throw new Error('Genre preference not found in answers');
    }

    // Get the genre ID based on the user's selection
    const genreId = getGenreId(genreAnswer.answer.toString());
    console.log('Selected genre ID:', genreId);

    // Get movies by genre first
    const genreMovies = await getMoviesByGenre(genreId, TMDB_API_KEY);
    console.log('Found movies by genre:', genreMovies.length);

    // Use AI to refine the selection based on other preferences
    const formattedAnswers = formatAnswersForPrompt(cleanedAnswers);
    const recommendedIds = await getMovieRecommendations(formattedAnswers, GEMINI_API_KEY);
    
    // Prioritize movies that match both genre and AI recommendations
    const prioritizedMovies = genreMovies
      .filter(movie => recommendedIds.includes(movie.id))
      .slice(0, 6);

    // If we don't have enough movies, add more from the genre-matched list
    const finalMovies = [
      ...prioritizedMovies,
      ...genreMovies.filter(movie => !prioritizedMovies.includes(movie))
    ].slice(0, 6);

    const movieDetailsPromises = finalMovies.map(movie => 
      getMovieDetails(movie.id, TMDB_API_KEY)
    );

    const movies = (await Promise.all(movieDetailsPromises))
      .filter((movie): movie is MovieRecommendation => movie !== null);

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