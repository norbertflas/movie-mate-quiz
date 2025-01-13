import { TMDBMovie } from "./types";

export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }

  return response.json();
};