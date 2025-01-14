import { TMDBMovie } from "./types";
import { tmdbFetch } from "./utils";

export const getTrendingMovies = async (region?: string): Promise<TMDBMovie[]> => {
  const params = new URLSearchParams();
  if (region) {
    params.append('region', region);
  }
  
  const response = await tmdbFetch(`/trending/movie/week?${params.toString()}`);
  return response.results;
};