import { supabase } from "@/integrations/supabase/client";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export async function getTMDBApiKey() {
  try {
    const { data, error } = await supabase.functions.invoke('get-tmdb-key', {
      method: 'POST',
    });

    if (error) {
      console.error('Error fetching TMDB API key:', error);
      throw error;
    }

    if (!data?.TMDB_API_KEY) {
      throw new Error('TMDB API key not found in response');
    }

    return data.TMDB_API_KEY;
  } catch (error) {
    console.error('Failed to get TMDB API key:', error);
    throw error;
  }
}