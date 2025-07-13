import { supabase } from "@/integrations/supabase/client";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import type { TMDBMovie, TMDBDiscoverParams } from "./types";
import i18n from "@/i18n";

export async function discoverMovies(params: TMDBDiscoverParams = {}): Promise<TMDBMovie[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const currentLang = params.language || i18n.language;
    
    // Get current date to filter out upcoming movies
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      language: currentLang,
      page: (params.page || 1).toString(),
      // Filter out upcoming movies by default
      'primary_release_date.lte': params.releaseDateLte || currentDate,
      ...(params.genres?.length ? { with_genres: params.genres.join(',') } : {}),
      ...(params.minVoteCount ? { 'vote_count.gte': params.minVoteCount.toString() } : {}),
      ...(params.minVoteAverage ? { 'vote_average.gte': params.minVoteAverage.toString() } : {}),
      ...(params.releaseDateGte ? { 'primary_release_date.gte': params.releaseDateGte } : {}),
      ...(params.sortBy ? { sort_by: params.sortBy } : { sort_by: 'popularity.desc' }),
      ...(params.region ? { region: params.region } : {}),
      ...(params.includeAdult !== undefined ? { include_adult: params.includeAdult.toString() } : {}),
      ...(params.withKeywords ? { with_keywords: params.withKeywords } : {})
    });

    const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Additional filter to ensure we only get released movies
    const releasedMovies = data.results.filter((movie: TMDBMovie) => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate <= today;
    });
    
    console.log(`Filtered out ${data.results.length - releasedMovies.length} upcoming movies`);
    return releasedMovies;
  } catch (error) {
    console.error('Error discovering movies:', error);
    throw error;
  }
}