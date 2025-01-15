import { TMDBMovie } from "./types";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import i18n from "@/i18n";

export const getTrendingMovies = async (context: { queryKey: string[] }): Promise<TMDBMovie[]> => {
  const apiKey = await getTMDBApiKey();
  const currentLang = i18n.language;
  const [_, region, page = "1"] = context.queryKey;
  
  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: currentLang,
    page: page.toString(),
    ...(region ? { region } : {})
  });
  
  const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?${queryParams}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.results;
};

export const getPopularMovies = async (context: { queryKey: string[] }): Promise<TMDBMovie[]> => {
  const apiKey = await getTMDBApiKey();
  const currentLang = i18n.language;
  const [_, region, page = "1"] = context.queryKey;
  
  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: currentLang,
    page: page.toString(),
    ...(region ? { region } : {})
  });
  
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?${queryParams}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.results;
};