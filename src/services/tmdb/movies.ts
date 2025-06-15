
import { TMDB_BASE_URL } from "./config";

export async function getMovieDetails(movieId: number) {
  try {
    // Use the access token instead of API key for better reliability
    const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('TMDB access token not found');
    }

    // Fetch comprehensive movie details with all append_to_response options
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits,videos,keywords,reviews,recommendations,similar,release_dates,watch/providers,images,external_ids`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
    const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('TMDB access token not found');
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/reviews?language=en-US&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
    const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('TMDB access token not found');
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
