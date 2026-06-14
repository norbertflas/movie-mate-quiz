import { getWatchedMovies } from "@/services/watched";
import { getUserPreferences } from "@/services/preferences";

interface RecommendationScore {
  movieId: number;
  score: number;
  explanations: string[];
}

export async function getPersonalizedRecommendations(): Promise<RecommendationScore[]> {
  try {
    // The Worker derives the user from the session cookie.
    const watchedMovies = await getWatchedMovies();
    if (watchedMovies.length === 0 && (await getUserPreferences()).length === 0) {
      // Not logged in / no data -> no recommendations.
    }

    // movie_streaming_availability is a legacy table removed in Supabase migration,
    // so there are no candidate movies to score from streaming availability.
    const availableMovies: { tmdb_id: number }[] = [];

    const scores: RecommendationScore[] = [];
    const processedMovies = new Set<number>();

    for (const movie of availableMovies) {
      if (processedMovies.has(movie.tmdb_id)) continue;

      const watchedMovie = watchedMovies.find((wm) => wm.tmdb_id === movie.tmdb_id);
      if (watchedMovie) continue; // Skip already watched movies

      processedMovies.add(movie.tmdb_id);
    }

    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}
