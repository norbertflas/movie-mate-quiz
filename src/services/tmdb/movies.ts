
import { getTMDBApiKey } from "./config";
import { supabase } from "@/integrations/supabase/client";
import { TMDB_BASE_URL } from "./config";

export async function getMovieDetails(movieId: number) {
  try {
    const apiKey = await getTMDBApiKey();

    // Fetch comprehensive movie details with all append_to_response options
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits,videos,keywords,reviews,recommendations,similar,release_dates,watch/providers,images,external_ids&api_key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Comprehensive movie details loaded:', data);
    return data;
  } catch (error) {
    console.error('Error fetching comprehensive movie details:', error);
    throw error;
  }
}

export async function getMovieReviews(movieId: number, page: number = 1) {
  try {
    const apiKey = await getTMDBApiKey();

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/reviews?language=en-US&page=${page}&api_key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
}

export async function getMovieVideos(movieId: number) {
  try {
    const apiKey = await getTMDBApiKey();

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US&api_key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    throw error;
  }
}

export async function getMovieWatchProviders(movieId: number, region: string = 'US') {
  try {
    const response = await supabase.functions.invoke('get-tmdb-watch-providers', {
      body: JSON.stringify({ tmdb_id: movieId, region })
    });

    if (response.error) {
      console.error('Error fetching watch providers:', response.error);
      return { services: [], region, timestamp: new Date().toISOString(), source: 'tmdb' };
    }

    return response.data;
  } catch (error) {
    console.error('Error in getMovieWatchProviders:', error);
    return { services: [], region, timestamp: new Date().toISOString(), source: 'tmdb' };
  }
}
