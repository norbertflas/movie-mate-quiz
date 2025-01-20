import { supabase } from "@/integrations/supabase/client";
import { getMovieDetails } from "@/services/tmdb";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { getCollaborativeRecommendations } from "@/utils/collaborativeFiltering";
import type { MovieRecommendation } from "../QuizTypes";

const DEFAULT_MOVIE_IDS = [299536, 24428, 99861, 157336, 118340, 293660];

export async function getQuizRecommendations(userId?: string): Promise<MovieRecommendation[]> {
  try {
    const movieIds = userId ? 
      await getCollaborativeRecommendations(userId) :
      DEFAULT_MOVIE_IDS.slice(0, 6);

    if (!movieIds || movieIds.length === 0) {
      throw new Error("No recommendations generated");
    }

    const recommendationsPromises = movieIds.map(async (movieId) => {
      try {
        const movieDetails = await getMovieDetails(movieId);
        const streamingServices = await getStreamingAvailability(movieId);
        
        const recommendation: MovieRecommendation = {
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
            ...(userId ? ["Popular among users with similar taste"] : []),
            ...(streamingServices.length > 0 ? [`Available on ${streamingServices.map(s => s.service).join(', ')}`] : [])
          ]
        };
        return recommendation;
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