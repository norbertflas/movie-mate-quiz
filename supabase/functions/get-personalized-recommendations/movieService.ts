import { MovieRecommendation } from "./types.ts";

export async function getMovieDetails(id: number, apiKey: string): Promise<MovieRecommendation | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=videos`
    );
    
    if (!response.ok) {
      console.error(`Error fetching TMDB data for movie ${id}:`, response.status);
      return null;
    }
    
    const movieData = await response.json();
    return {
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      poster_path: movieData.poster_path,
      release_date: movieData.release_date,
      vote_average: movieData.vote_average * 10,
      genre: movieData.genres?.[0]?.name || 'Unknown',
      trailer_url: movieData.videos?.results?.[0]?.key 
        ? `https://www.youtube.com/watch?v=${movieData.videos.results[0].key}`
        : null
    };
  } catch (error) {
    console.error(`Error getting movie details for ID ${id}:`, error);
    return null;
  }
}