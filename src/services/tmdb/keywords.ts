import { supabase } from "@/integrations/supabase/client";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";

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