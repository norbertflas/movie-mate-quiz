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

    if (!TMDB_API_KEY) {
      console.error('Missing TMDB_API_KEY');
      throw new Error('TMDB API key is not configured');
    }

    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY');
      throw new Error('Gemini API key is not configured. Please add it in Supabase Edge Function Secrets.');
    }

    const requestData: RequestData = await req.json();
    console.log('Raw request data:', requestData);

    // Handle personalized recommendations based on prompt and selected movies
    if (requestData.prompt || requestData.selectedMovies) {
      console.log('Processing personalized recommendations with prompt:', requestData.prompt);
      console.log('Selected movies:', requestData.selectedMovies);
      
      try {
        const input = requestData.prompt || 'Recommend popular movies based on my selected favorites';
        
        // Create a more specific prompt that includes user preferences
        let enhancedPrompt = input;
        if (requestData.selectedMovies && requestData.selectedMovies.length > 0) {
          enhancedPrompt = `${input}\n\nI particularly enjoyed these movies: ${requestData.selectedMovies.map(m => m.title).join(', ')}. Please recommend movies that align with these preferences.`;
        }
        
        const { data: recommendations } = await getMovieRecommendations(
          enhancedPrompt,
          requestData.selectedMovies || [],
          GEMINI_API_KEY
        );

        console.log('AI recommended movie IDs:', recommendations);

        // Get detailed movie information for each recommendation
        const movieDetailsPromises = recommendations.slice(0, 8).map(async (movieId) => {
          try {
            return await getMovieDetails(movieId, TMDB_API_KEY);
          } catch (error) {
            console.error(`Failed to get details for movie ${movieId}:`, error);
            return null;
          }
        });

        const movies = (await Promise.all(movieDetailsPromises))
          .filter((movie): movie is MovieRecommendation => movie !== null);

        if (movies.length === 0) {
          throw new Error('No valid movies found for the given recommendations');
        }

        console.log('Successfully processed personalized recommendations:', movies.length);
        
        return new Response(JSON.stringify(movies), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error processing personalized recommendations:', error);
        
        // Enhanced fallback with more variety
        console.log('Using enhanced fallback recommendations');
        const fallbackGenres = [28, 35, 18, 53, 878]; // Action, Comedy, Drama, Thriller, Sci-Fi
        const randomGenre = fallbackGenres[Math.floor(Math.random() * fallbackGenres.length)];
        
        const fallbackMovies = await getMoviesByGenre(randomGenre, TMDB_API_KEY);
        const movieDetailsPromises = fallbackMovies.slice(0, 6).map(movie => 
          getMovieDetails(movie.id, TMDB_API_KEY)
        );

        const movies = (await Promise.all(movieDetailsPromises))
          .filter((movie): movie is MovieRecommendation => movie !== null);

        return new Response(JSON.stringify(movies), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle quiz-based recommendations
    if (!requestData?.answers || !Array.isArray(requestData.answers)) {
      throw new Error('Invalid request format: either prompt/selectedMovies or answers array must be provided');
    }

    const cleanedAnswers = cleanAnswers(requestData.answers);
    console.log('Cleaned answers:', cleanedAnswers);

    // Find genre from answers
    const genreAnswer = cleanedAnswers.find(answer => 
      answer.questionId === 'genres' || 
      answer.questionId === 'genre' || 
      answer.questionId === 'preferredGenre' ||
      answer.questionId === 'preferredGenres'
    );

    if (!genreAnswer) {
      console.error('Available answers:', cleanedAnswers);
      
      // Try to determine genre from mood as fallback
      const moodAnswer = cleanedAnswers.find(answer => answer.questionId === 'mood');
      if (moodAnswer) {
        console.log('Using mood as genre fallback:', moodAnswer.answer);
        let fallbackGenre = 'comedy';
        const mood = moodAnswer.answer.toString().toLowerCase();
        if (mood.includes('laugh') || mood.includes('śmiać')) fallbackGenre = 'comedy';
        else if (mood.includes('adrenaline') || mood.includes('exciting')) fallbackGenre = 'action';
        else if (mood.includes('touching') || mood.includes('heartfelt')) fallbackGenre = 'drama';
        else if (mood.includes('relax')) fallbackGenre = 'documentary';
        
        const genreId = getGenreId(fallbackGenre);
        console.log('Fallback genre ID from mood:', genreId);
        
        const genreMovies = await getMoviesByGenre(genreId, TMDB_API_KEY);
        const movieDetailsPromises = genreMovies.slice(0, 8).map(movie => 
          getMovieDetails(movie.id, TMDB_API_KEY)
        );

        const movies = (await Promise.all(movieDetailsPromises))
          .filter((movie): movie is MovieRecommendation => movie !== null);

        return new Response(JSON.stringify(movies), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('Genre preference not found in answers and no mood fallback available');
    }

    const genreId = getGenreId(genreAnswer.answer.toString());
    console.log('Selected genre ID:', genreId);

    const genreMovies = await getMoviesByGenre(genreId, TMDB_API_KEY);
    console.log('Found movies by genre:', genreMovies.length);

    if (!genreMovies || genreMovies.length === 0) {
      throw new Error(`No movies found for genre ID ${genreId}`);
    }

    const formattedAnswers = formatAnswersForPrompt(cleanedAnswers);
    console.log('Formatted answers for AI:', formattedAnswers);
    
    try {
      const { data: recommendedIds } = await getMovieRecommendations(formattedAnswers, [], GEMINI_API_KEY);
      console.log('Received recommended IDs:', recommendedIds);
      
      // Find movies from our genre movies that match the recommended IDs
      const prioritizedMovies = genreMovies
        .filter(movie => recommendedIds.includes(movie.id))
        .slice(0, 5);

      // If we don't have 5 matches, add more movies from the genre
      const finalMovies = [
        ...prioritizedMovies,
        ...genreMovies
          .filter(movie => !prioritizedMovies.some(pm => pm.id === movie.id))
          .slice(0, 8 - prioritizedMovies.length)
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
      
      // Fallback to just using the top movies by genre if AI recommendations fail
      const fallbackMovies = genreMovies
        .slice(0, 8)
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
        details: 'Check the edge function logs for more information'
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
