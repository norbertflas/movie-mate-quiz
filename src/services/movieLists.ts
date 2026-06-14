export interface MovieList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export interface CreateMovieListInput {
  name: string;
  description?: string;
  is_public?: boolean;
}

export const createMovieList = async (_input: CreateMovieListInput): Promise<MovieList | null> => {
  // legacy table removed in Supabase migration
  return null;
};

export const getMovieLists = async (): Promise<MovieList[]> => {
  // legacy table removed in Supabase migration
  return [];
};

export const addMovieToList = async (_listId: string, _movieId: number, _title: string): Promise<void> => {
  // legacy table removed in Supabase migration
};

export const removeMovieFromList = async (_listId: string, _movieId: number): Promise<void> => {
  // legacy table removed in Supabase migration
};
