import { supabase } from "@/integrations/supabase/client";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import type { TMDBMovie, TMDBRecommendationParams } from "./types";
import i18n from "@/i18n";

export async function getMovieRecommendations(
  movieId: number, 
  params: TMDBRecommendationParams = {}
): Promise<TMDBMovie[]> {
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