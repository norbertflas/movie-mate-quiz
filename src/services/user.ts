import { api, ApiError } from "@/lib/api-client";

export interface SavedMovie {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  created_at: string;
}

interface SavedRow {
  id: string;
  userId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  createdAt: string;
}

const mapSaved = (r: SavedRow): SavedMovie => ({
  id: r.id,
  user_id: r.userId,
  tmdb_id: r.tmdbId,
  title: r.title,
  poster_path: r.posterPath,
  created_at: r.createdAt,
});

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
  try {
    const rows = await api.get<SavedRow[]>("/movies/saved");
    return rows.map(mapSaved);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return [];
    throw error;
  }
};

export const saveMovies = async (
  movies: { tmdb_id: number; title: string; poster_path?: string | null }[]
): Promise<void> => {
  // The Worker derives the user from the session cookie.
  for (const movie of movies) {
    await api.post("/movies/saved", {
      tmdbId: movie.tmdb_id,
      title: movie.title,
      posterPath: movie.poster_path ?? null,
    });
  }
};

export const removeSavedMovie = async (tmdb_id: number): Promise<void> => {
  await api.delete(`/movies/saved/${tmdb_id}`);
};

export const isSavedMovie = async (tmdb_id: number): Promise<boolean> => {
  const saved = await getSavedMovies();
  return saved.some((m) => m.tmdb_id === tmdb_id);
};
