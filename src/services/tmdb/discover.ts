import { supabase } from "@/integrations/supabase/client";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import type { TMDBMovie, TMDBDiscoverParams } from "./types";
import i18n from "@/i18n";

export async function discoverMovies(params: TMDBDiscoverParams = {}): Promise<TMDBMovie[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const currentLang = params.language || i18n.language;
    
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      language: currentLang,
      page: (params.page || 1).toString(),
      ...(params.genres?.length ? { with_genres: params.genres.join(',') } : {}),
      ...(params.minVoteCount ? { 'vote_count.gte': params.minVoteCount.toString() } : {}),
      ...(params.minVoteAverage ? { 'vote_average.gte': params.minVoteAverage.toString() } : {}),
      ...(params.releaseDateGte ? { 'primary_release_date.gte': params.releaseDateGte } : {}),
      ...(params.releaseDateLte ? { 'primary_release_date.lte': params.releaseDateLte } : {}),
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
    return data.results;
  } catch (error) {
    console.error('Error discovering movies:', error);
    throw error;
  }
}