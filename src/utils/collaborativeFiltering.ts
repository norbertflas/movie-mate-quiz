import { supabase } from "@/integrations/supabase/client";
import type { TMDBMovie } from "@/services/tmdb";

interface UserPreference {
  movieId: number;
  rating: number;
}

export async function getCollaborativeRecommendations(userId: string): Promise<TMDBMovie[]> {
  try {
    // Get user's watched movies and ratings
    const { data: userWatched, error: watchError } = await supabase
      .from('watched_movies')
      .select('tmdb_id, rating')
      .eq('user_id', userId);

    if (watchError) throw watchError;

    // Find similar users based on movie ratings
    const { data: similarUsers, error: similarError } = await supabase
      .from('watched_movies')
      .select('user_id, tmdb_id, rating')
      .in('tmdb_id', userWatched?.map(m => m.tmdb_id) || [])
      .neq('user_id', userId);

    if (similarError) throw similarError;

    // Calculate similarity scores
    const userPreferences = new Map<string, UserPreference[]>();
    similarUsers?.forEach(rating => {
      if (!userPreferences.has(rating.user_id)) {
        userPreferences.set(rating.user_id, []);
      }
      userPreferences.get(rating.user_id)?.push({
        movieId: rating.tmdb_id,
        rating: rating.rating || 0
      });
    });

    // Get recommendations based on similar users' highly rated movies
    const recommendedMovies = new Set<number>();
    userPreferences.forEach((preferences, similarUserId) => {
      preferences
        .filter(p => p.rating >= 7 && !userWatched?.some(w => w.tmdb_id === p.movieId))
        .forEach(p => recommendedMovies.add(p.movieId));
    });

    return Array.from(recommendedMovies);
  } catch (error) {
    console.error('Error getting collaborative recommendations:', error);
    return [];
  }
}