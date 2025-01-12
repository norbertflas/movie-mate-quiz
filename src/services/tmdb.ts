import { supabase } from "@/integrations/supabase/client";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  genre_ids: number[];
}

async function getTMDBApiKey() {
  const { data: { TMDB_API_KEY } } = await supabase.functions.invoke('get-tmdb-key');
  return TMDB_API_KEY;
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pl-PL`
  );
  const data = await response.json();
  return data.results;
}

export async function getPopularMovies(): Promise<TMDBMovie[]> {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=pl-PL`
  );
  const data = await response.json();
  return data.results;
}

export async function getMovieRecommendations(movieId: number): Promise<TMDBMovie[]> {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${apiKey}&language=pl-PL`
  );
  const data = await response.json();
  return data.results;
}

export function getImageUrl(path: string | null): string {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE_URL}${path}`;
}