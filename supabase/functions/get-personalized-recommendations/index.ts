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

    // Handle personalized recommendations based on prompt and selected movies
    if (requestData.prompt && requestData.selectedMovies) {
      console.log('Processing personalized recommendations with prompt:', requestData.prompt);
      
      try {
        const { data: recommendations } = await getMovieRecommendations(
          requestData.prompt,
          requestData.selectedMovies,
          GEMINI_API_KEY
        );

        const movieDetailsPromises = recommendations.slice(0, 6).map(movieId => 
          getMovieDetails(movieId, TMDB_API_KEY)
        );

        const movies = (await Promise.all(movieDetailsPromises))
          .filter((movie): movie is MovieRecommendation => movie !== null);

        console.log('Successfully processed personalized recommendations:', movies.length);
        
        return new Response(JSON.stringify(movies), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error processing personalized recommendations:', error);
        throw error;
      }
    }

    // Handle quiz-based recommendations
    if (!requestData?.answers || !Array.isArray(requestData.answers)) {
      throw new Error('Invalid request format: answers array must be provided for quiz recommendations');
    }

    const cleanedAnswers = cleanAnswers(requestData.answers);
    console.log('Cleaned answers:', cleanedAnswers);

    const genreAnswer = cleanedAnswers.find(answer => 
      answer.questionId === 'genre'
    );

    if (!genreAnswer) {
      console.error('Available answers:', cleanedAnswers);
      throw new Error('Genre preference not found in answers');
    }

    const genreId = getGenreId(genreAnswer.answer.toString());
    console.log('Selected genre ID:', genreId);

    const genreMovies = await getMoviesByGenre(genreId, TMDB_API_KEY);
    console.log('Found movies by genre:', genreMovies.length);

    if (!genreMovies || genreMovies.length === 0) {
      throw new Error(`No movies found for genre ID ${genreId}`);
    }

    const formattedAnswers = formatAnswersForPrompt(cleanedAnswers);
    
    try {
      const recommendedIds = await getMovieRecommendations(formattedAnswers, [], GEMINI_API_KEY);
      console.log('Received recommended IDs:', recommendedIds);
      
      const prioritizedMovies = genreMovies
        .filter(movie => recommendedIds.includes(movie.id))
        .slice(0, 6);

      const finalMovies = [
        ...prioritizedMovies,
        ...genreMovies
          .filter(movie => !prioritizedMovies.some(pm => pm.id === movie.id))
          .slice(0, 6 - prioritizedMovies.length)
      ];

      const movieDetailsPromises = finalMovies.map(movie => 
        getMovieDetails(movie.id, TMDB_API_KEY)
      );

      const movies = (await Promise.all(movieDetailsPromises))
        .filter((movie): movie is MovieRecommendation => movie !== null);

      if (!movies || movies.length === 0) {
        throw new Error('No valid movies found after processing');
      }

      console.log('Successfully processed movies:', movies.length);
      
      return new Response(JSON.stringify(movies), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (aiError) {
      console.error('AI recommendations failed, falling back to genre-based:', aiError);
      
      const fallbackMovies = genreMovies
        .slice(0, 6)
        .map(movie => getMovieDetails(movie.id, TMDB_API_KEY));

      const movies = (await Promise.all(fallbackMovies))
        .filter((movie): movie is MovieRecommendation => movie !== null);

      if (!movies || movies.length === 0) {
        throw new Error('No valid movies found in fallback');
      }

      return new Response(JSON.stringify(movies), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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