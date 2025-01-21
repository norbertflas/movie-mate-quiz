import { TMDB_BASE_URL } from "./config";

export async function getMovieDetails(movieId: number) {
  try {
    // Use import.meta.env instead of process.env
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    
    if (!apiKey) {
      throw new Error('TMDB API key not found');
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}
