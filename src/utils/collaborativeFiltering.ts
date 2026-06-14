import { api } from "@/lib/api-client";
import { getWatchedMovies } from "@/services/watched";

interface UserPreference {
  movieId: number;
  rating: number;
}

interface WatchedAllRow {
  userId: string;
  tmdbId: number;
  rating: number | null;
}

export async function getCollaborativeRecommendations(userId: string): Promise<number[]> {
  try {
    // Current user's watched movies (Worker derives the user from the session cookie).
    const watched = await getWatchedMovies();
    const userWatched = watched.map((m) => ({ tmdb_id: m.tmdb_id, rating: m.rating }));

    // Cross-user anonymized watched list.
    let allRows: WatchedAllRow[] = [];
    try {
      allRows = await api.get<WatchedAllRow[]>("/movies/watched/all");
    } catch {
      return [];
    }

    const watchedIds = new Set(userWatched.map((m) => m.tmdb_id));

    // Find similar users based on overlapping watched movies.
    const similarUsers = allRows.filter(
      (r) => r.userId !== userId && watchedIds.has(r.tmdbId)
    );

    // Calculate similarity scores.
    const userPreferences = new Map<string, UserPreference[]>();
    similarUsers.forEach((row) => {
      if (!userPreferences.has(row.userId)) {
        userPreferences.set(row.userId, []);
      }
      userPreferences.get(row.userId)?.push({
        movieId: row.tmdbId,
        rating: row.rating || 0,
      });
    });

    // Get recommendations based on similar users' highly rated movies.
    const recommendedMovies = new Set<number>();
    userPreferences.forEach((preferences) => {
      preferences
        .filter((p) => p.rating >= 7 && !watchedIds.has(p.movieId))
        .forEach((p) => recommendedMovies.add(p.movieId));
    });

    return Array.from(recommendedMovies);
  } catch (error) {
    console.error('Error getting collaborative recommendations:', error);
    return [];
  }
}
