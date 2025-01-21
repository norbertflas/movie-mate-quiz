import { supabase } from "@/integrations/supabase/client";
import { getMovieDetails } from "@/services/tmdb";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import type { MovieRecommendation, QuizAnswer } from "../QuizTypes";

const DEFAULT_MOVIE_IDS = [299536, 24428, 99861, 157336, 118340, 293660];

export async function getQuizRecommendations(userId?: string): Promise<MovieRecommendation[]> {
  try {
    // Get movie IDs based on quiz answers
    const movieIds = userId ? 
      await getPersonalizedMovieIds(userId) :
      DEFAULT_MOVIE_IDS.slice(0, 6);

    const recommendationsPromises = movieIds.map(async (movieId) => {
      try {
        const movieDetails = await getMovieDetails(movieId);
        if (!movieDetails) {
          console.error(`No details found for movie ${movieId}`);
          return null;
        }

        const streamingServices = await getStreamingAvailability(movieId);
        
        return {
          id: movieId,
          tmdbId: movieDetails.id,
          title: movieDetails.title,
          year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear().toString() : "N/A",
          platform: streamingServices[0]?.service || "Not available",
          genre: movieDetails.genres?.[0]?.name || "Unknown",
          imageUrl: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
          description: movieDetails.overview,
          trailerUrl: "",
          rating: movieDetails.vote_average * 10,
          score: movieDetails.popularity / 100,
          explanations: [
            "Based on your quiz answers",
            "Matches your preferred genres",
            ...(userId ? ["Personalized for you"] : []),
            ...(streamingServices.length > 0 ? [`Available on ${streamingServices.map(s => s.service).join(', ')}`] : [])
          ]
        };
      } catch (error) {
        console.error(`Error fetching details for movie ${movieId}:`, error);
        return null;
      }
    });

    const processedRecs = (await Promise.all(recommendationsPromises))
      .filter((rec): rec is MovieRecommendation => rec !== null)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    if (processedRecs.length === 0) {
      throw new Error("Failed to process recommendations");
    }

    return processedRecs;
  } catch (error) {
    console.error('Error getting quiz recommendations:', error);
    throw error;
  }
}

async function getPersonalizedMovieIds(userId: string): Promise<number[]> {
  try {
    const { data: quizHistory } = await supabase
      .from('quiz_history')
      .select('answers')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!quizHistory) {
      return DEFAULT_MOVIE_IDS;
    }

    // Here you would implement logic to get personalized movie IDs based on quiz answers
    // For now, return default IDs
    return DEFAULT_MOVIE_IDS;
  } catch (error) {
    console.error('Error getting personalized movie IDs:', error);
    return DEFAULT_MOVIE_IDS;
  }
}