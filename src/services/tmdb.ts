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

export async function getMovieRecommendations(movieId: number): Promise<TMDBMovie[]> {
  try {
    const apiKey = await getTMDBApiKey();
    const currentLang = i18n.language;
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${apiKey}&language=${currentLang}`
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

export function getImageUrl(path: string | null): string {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE_URL}${path}`;
}