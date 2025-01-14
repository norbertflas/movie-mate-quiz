import { TMDBMovie } from "./types";
import { tmdbFetch } from "./utils";
import i18n from "@/i18n";

export const getTrendingMovies = async (): Promise<TMDBMovie[]> => {
  const currentLang = i18n.language;
  const response = await tmdbFetch(`/trending/movie/week?language=${currentLang}`);
  return response.results;
};

export const getPopularMovies = async (): Promise<TMDBMovie[]> => {
  const currentLang = i18n.language;
  const response = await tmdbFetch(`/movie/popular?language=${currentLang}`);
  return response.results;
};