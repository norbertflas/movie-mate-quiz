import type { MovieRecommendation } from "./types.ts";

export async function getMovieDetails(movieId: number, apiKey: string): Promise<MovieRecommendation | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=videos`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const videos = data.videos?.results || [];
    const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube");

    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      poster_path: data.poster_path,
      release_date: data.release_date,
      vote_average: data.vote_average * 10,
      genre: data.genres?.[0]?.name || "Unknown",
      trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

export async function getMoviesByGenre(genreId: number, apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=100`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return [];
  }
}