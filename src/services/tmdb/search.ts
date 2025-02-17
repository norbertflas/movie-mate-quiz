
import { supabase } from "@/integrations/supabase/client";
import { TMDB_BASE_URL, getTMDBApiKey } from "./config";
import type { TMDBMovie, TMDBPerson } from "./types";
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

export async function searchPeople(query: string): Promise<TMDBPerson[]> {
  try {
    if (!query || query.length < 3) return [];
    
    const apiKey = await getTMDBApiKey();
    const currentLang = i18n.language;
    const response = await fetch(
      `${TMDB_BASE_URL}/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=${currentLang}&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Fetch detailed information for each person
    const detailedPeople = await Promise.all(
      data.results.map(async (person: TMDBPerson) => {
        const detailResponse = await fetch(
          `${TMDB_BASE_URL}/person/${person.id}?api_key=${apiKey}&language=${currentLang}`
        );
        
        if (!detailResponse.ok) return person;
        
        const detailData = await detailResponse.json();
        return {
          ...person,
          birthday: detailData.birthday,
          deathday: detailData.deathday,
          place_of_birth: detailData.place_of_birth,
          biography: detailData.biography
        };
      })
    );
    
    return detailedPeople;
  } catch (error) {
    console.error('Error searching people:', error);
    throw error;
  }
}
