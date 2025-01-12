import { supabase } from "@/integrations/supabase/client";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function getTMDBApiKey() {
  const { data: { TMDB_API_KEY } } = await supabase.functions.invoke('get-tmdb-key');
  return TMDB_API_KEY;
}

export async function searchMovies(query: string) {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pl-PL`
  );
  return response.json();
}

export async function getMovieDetails(movieId: number) {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=pl-PL`
  );
  return response.json();
}

export async function getMovieRecommendations(movieId: number) {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${apiKey}&language=pl-PL`
  );
  return response.json();
}

export async function getPopularMovies() {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=pl-PL`
  );
  return response.json();
}