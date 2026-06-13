import { api, ApiError } from "@/lib/api-client";

export interface WatchedMovie {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  rating: number | null;
  watched_at: string;
  created_at: string;
}

interface WatchedRow {
  id: string;
  userId: string;
  tmdbId: number;
  title: string;
  rating: number | null;
  watchedAt: string;
  createdAt: string;
}

const mapWatched = (r: WatchedRow): WatchedMovie => ({
  id: r.id,
  user_id: r.userId,
  tmdb_id: r.tmdbId,
  title: r.title,
  rating: r.rating,
  watched_at: r.watchedAt,
  created_at: r.createdAt,
});

export const getWatchedMovies = async (): Promise<WatchedMovie[]> => {
  try {
    const rows = await api.get<WatchedRow[]>("/movies/watched");
    return rows.map(mapWatched);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return [];
    throw error;
  }
};

export const getRatedMovies = async (): Promise<WatchedMovie[]> => {
  const watched = await getWatchedMovies();
  return watched.filter((m) => m.rating != null);
};

export const addWatchedMovie = async (movie: {
  tmdb_id: number;
  title?: string;
  rating?: number;
}): Promise<void> => {
  await api.post("/movies/watched", {
    tmdbId: movie.tmdb_id,
    title: movie.title ?? "",
    rating: movie.rating,
  });
};

export const removeWatchedMovie = async (id: string): Promise<void> => {
  await api.delete(`/movies/watched/${id}`);
};
