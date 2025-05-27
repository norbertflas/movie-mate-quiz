
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
      throw new Error('Gemini API key is not configured');
    }

    const requestData: RequestData = await req.json();
    console.log('Enhanced request data:', requestData);

    // Enhanced personalized recommendations with streaming info and region support
    if (requestData.prompt || requestData.selectedMovies || requestData.filters) {
      console.log('Processing enhanced personalized recommendations');
      console.log('Prompt:', requestData.prompt);
      console.log('Filters:', requestData.filters);
      
      try {
        let enhancedPrompt = requestData.prompt || 'Recommend highly-rated popular movies';
        
        // Uwzględnij filtry w prompcie z regionem
        if (requestData.filters) {
          const filters = requestData.filters;
          enhancedPrompt += `\n\nUser preferences for region ${filters.region?.toUpperCase() || 'US'}:`;
          if (filters.platforms?.length > 0) {
            enhancedPrompt += `\n- Must be available on AT LEAST ONE of: ${filters.platforms.join(', ')}`;
          }
          if (filters.genres?.length > 0) {
            enhancedPrompt += `\n- Preferred genres: ${filters.genres.join(', ')}`;
          }
          if (filters.mood) {
            enhancedPrompt += `\n- Mood: ${filters.mood}`;
          }
          if (filters.runtime) {
            enhancedPrompt += `\n- Runtime: ${filters.runtime.min || 0}-${filters.runtime.max || 999} minutes`;
          }
          if (filters.region) {
            enhancedPrompt += `\n- Region: ${filters.region.toUpperCase()}`;
          }
          if (filters.languages?.length > 0) {
            enhancedPrompt += `\n- Language preference: ${filters.languages.join(', ')}`;
          }
          enhancedPrompt += `\n\nIMPORTANT: Movies should be available in ${filters.region?.toUpperCase() || 'US'} region and on at least ONE of the specified platforms, not necessarily all of them.`;
        }
        
        if (requestData.selectedMovies && requestData.selectedMovies.length > 0) {
          enhancedPrompt += `\n\nUser particularly enjoyed: ${requestData.selectedMovies.map(m => m.title).join(', ')}.`;
        }
        
        console.log('Final enhanced prompt:', enhancedPrompt);
        
        const { data: recommendations } = await getMovieRecommendations(
          enhancedPrompt,
          requestData.selectedMovies || [],
          GEMINI_API_KEY
        );

        console.log('AI recommended movie IDs:', recommendations);

        // Get detailed movie information with enhanced data
        const movieDetailsPromises = recommendations.slice(0, 12).map(async (movieId) => {
          try {
            const movieDetails = await getMovieDetails(movieId, TMDB_API_KEY);
            
            // Add enhanced explanations based on user preferences with region support
            const explanations: string[] = [];
            
            if (requestData.filters?.genres && movieDetails.genres) {
              const matchingGenres = movieDetails.genres.filter(g => 
                requestData.filters.genres.some(userGenre => 
                  g.name.toLowerCase().includes(userGenre.toLowerCase()) ||
                  userGenre.toLowerCase().includes(g.name.toLowerCase())
                )
              );
              if (matchingGenres.length > 0) {
                explanations.push(`Matches your genre preference: ${matchingGenres.map(g => g.name).join(', ')}`);
              }
            }
            
            if (movieDetails.vote_average >= 7.5) {
              explanations.push('Highly rated by viewers');
            }
            
            if (movieDetails.vote_average >= 8.0) {
              explanations.push('Critically acclaimed');
            }
            
            if (requestData.filters?.mood) {
              const mood = requestData.filters.mood.toLowerCase();
              if (mood.includes('funny') || mood.includes('śmieszn')) {
                explanations.push('Perfect for a good laugh');
              } else if (mood.includes('touching') || mood.includes('wzrusza')) {
                explanations.push('Emotionally engaging');
              } else if (mood.includes('adrenaline') || mood.includes('adrena') || mood.includes('relax')) {
                if (mood.includes('adrenaline') || mood.includes('adrena')) {
                  explanations.push('Action-packed excitement');
                } else {
                  explanations.push('Perfect for relaxation');
                }
              }
            }
            
            // Dodaj informację o regionie
            if (requestData.filters?.region && requestData.filters.region !== 'us') {
              explanations.push(`Available in ${requestData.filters.region.toUpperCase()} region`);
            }
            
            if (explanations.length === 0) {
              explanations.push('Popular choice matching your preferences');
            }
            
            return {
              ...movieDetails,
              explanations
            };
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

        console.log('Successfully processed enhanced recommendations:', movies.length);
        
        return new Response(JSON.stringify(movies), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error processing enhanced recommendations:', error);
        
        // Enhanced fallback with better variety and region support
        console.log('Using enhanced fallback recommendations');
        const fallbackGenres = [28, 35, 18, 53, 878, 12]; // Action, Comedy, Drama, Thriller, Sci-Fi, Adventure
        const selectedGenres = requestData.filters?.genres || [];
        
        let genreIds = selectedGenres.map(genre => getGenreId(genre));
        if (genreIds.length === 0) {
          genreIds = fallbackGenres;
        }
        
        const fallbackMovies: any[] = [];
        
        for (const genreId of genreIds.slice(0, 3)) {
          try {
            const genreMovies = await getMoviesByGenre(genreId, TMDB_API_KEY);
            fallbackMovies.push(...genreMovies.slice(0, 4));
          } catch (error) {
            console.error(`Error getting movies for genre ${genreId}:`, error);
          }
        }
        
        const movieDetailsPromises = fallbackMovies.slice(0, 8).map(movie => 
          getMovieDetails(movie.id, TMDB_API_KEY)
        );

        const movies = (await Promise.all(movieDetailsPromises))
          .filter((movie): movie is MovieRecommendation => movie !== null)
          .map(movie => {
            const explanations = ['Popular choice in your preferred genre'];
            
            // Dodaj informację o regionie dla fallback
            if (requestData.filters?.region && requestData.filters.region !== 'us') {
              explanations.push(`Available in ${requestData.filters.region.toUpperCase()} region`);
            }
            
            return {
              ...movie,
              explanations
            };
          });

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
    console.error('Error in enhanced get-personalized-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the enhanced edge function logs for more information'
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
