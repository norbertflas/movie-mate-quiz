import { supabase } from "@/integrations/supabase/client";
import i18n from "@/i18n";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  video_id?: string;
}

async function getTMDBApiKey() {
  try {
    const { data, error } = await supabase.functions.invoke('get-tmdb-key');
    if (error) {
      console.error('Error fetching TMDB API key:', error);
      throw error;
    }
    if (!data?.TMDB_API_KEY) {
      throw new Error('TMDB API key not found');
    }
    return data.TMDB_API_KEY;
  } catch (error) {
    console.error('Failed to get TMDB API key:', error);
    throw error;
  }
}

export async function getMovieRecommendations(movieId: number, params: {
  page?: number;
  language?: string;
  region?: string;
} = {}): Promise<TMDBMovie[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const currentLang = params.language || i18n.language;
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      language: currentLang,
      page: (params.page || 1).toString(),
      ...(params.region ? { region: params.region } : {})
    });

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/recommendations?${queryParams}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
}

export async function discoverMovies(params: {
  genres?: string[];
  minVoteCount?: number;
  minVoteAverage?: number;
  releaseDateGte?: string;
  releaseDateLte?: string;
  sortBy?: string;
  page?: number;
  language?: string;
  region?: string;
  includeAdult?: boolean;
  withKeywords?: string;
} = {}): Promise<TMDBMovie[]> {
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

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${queryParams}`
    );
    
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

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  try {
    if (!query || query.length < 3) return [];
    
    const apiKey = await getTMDBApiKey();
    const currentLang = i18n.language;
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=${currentLang}&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
}

export async function getPopularMovies(): Promise<TMDBMovie[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const currentLang = i18n.language;
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=${currentLang}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
}

export async function getTrendingMovies(): Promise<TMDBMovie[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const currentLang = i18n.language;
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${apiKey}&language=${currentLang}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
}

export function getImageUrl(path: string | null): string {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE_URL}${path}`;
}

export async function getSimilarMovies(movieId: number, params: {
  page?: number;
  language?: string;
} = {}): Promise<TMDBMovie[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const currentLang = params.language || i18n.language;
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      language: currentLang,
      page: (params.page || 1).toString()
    });

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/similar?${queryParams}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
}

export async function getMovieKeywords(movieId: number): Promise<string[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/keywords?api_key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.keywords.map((keyword: { name: string }) => keyword.name);
  } catch (error) {
    console.error('Error fetching movie keywords:', error);
    throw error;
  }
}
