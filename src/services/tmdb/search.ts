import { supabase } from "@/integrations/supabase/client";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import type { TMDBMovie } from "./types";
import i18n from "@/i18n";

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