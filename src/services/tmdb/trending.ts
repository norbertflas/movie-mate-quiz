
import { TMDBMovie } from "./types";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import i18n from "@/i18n";

export const getTrendingMovies = async (context?: { queryKey: string[] }): Promise<TMDBMovie[]> => {
  const apiKey = await getTMDBApiKey();
  const currentLang = i18n.language || "en";
  
  // Extract parameters from query key safely
  let region = "";
  let page = "1";
  
  if (context?.queryKey && context.queryKey.length > 1) {
    region = context.queryKey[1] || "";
    page = context.queryKey[2] || "1";
  }
  
  console.log(`Fetching trending movies with language: ${currentLang}, region: ${region}, page: ${page}`);
  
  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: currentLang,
    page: page,
    ...(region ? { region } : {})
  });
  
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter out upcoming movies
    const today = new Date();
    const releasedMovies = data.results.filter((movie: TMDBMovie) => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate <= today;
    });
    
    console.log(`Filtered ${data.results.length - releasedMovies.length} upcoming movies from trending`);
    return releasedMovies;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    // Return empty array instead of throwing to prevent UI issues
    return [];
  }
};

export const getPopularMovies = async (context?: { queryKey: string[] }): Promise<TMDBMovie[]> => {
  const apiKey = await getTMDBApiKey();
  const currentLang = i18n.language || "en";
  
  // Extract parameters from query key safely
  let region = "";
  let page = "1";
  
  if (context?.queryKey && context.queryKey.length > 1) {
    region = context.queryKey[1] || "";
    page = context.queryKey[2] || "1";
  }
  
  console.log(`Fetching popular movies with language: ${currentLang}, region: ${region}, page: ${page}`);
  
  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: currentLang,
    page: page,
    ...(region ? { region } : {})
  });
  
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter out upcoming movies
    const today = new Date();
    const releasedMovies = data.results.filter((movie: TMDBMovie) => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate <= today;
    });
    
    console.log(`Filtered ${data.results.length - releasedMovies.length} upcoming movies from popular`);
    return releasedMovies;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    // Return empty array instead of throwing to prevent UI issues
    return [];
  }
};
