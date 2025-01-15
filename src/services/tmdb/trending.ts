import { TMDBMovie } from "./types";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import i18n from "@/i18n";

export const getTrendingMovies = async (region?: string): Promise<TMDBMovie[]> => {
  const apiKey = await getTMDBApiKey();
  const currentLang = i18n.language;
  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: currentLang,
    ...(region ? { region } : {})
  });
  
  const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?${queryParams}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.results;
};

export const getPopularMovies = async (region?: string): Promise<TMDBMovie[]> => {
  const apiKey = await getTMDBApiKey();
  const currentLang = i18n.language;
  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: currentLang,
    ...(region ? { region } : {})
  });
  
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?${queryParams}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.results;
};