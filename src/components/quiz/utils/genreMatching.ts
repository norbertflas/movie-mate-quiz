import { MOVIE_TAGS } from "../constants/movieTags";

const GENRE_COMPATIBILITY = {
  "Action": ["Thriller", "Adventure", "Sci-Fi"],
  "Comedy": ["Romance", "Family", "Adventure"],
  "Drama": ["Romance", "Thriller", "Crime"],
  "Sci-Fi": ["Action", "Adventure", "Thriller"],
  "Horror": ["Thriller", "Mystery", "Supernatural"],
  "Romance": ["Comedy", "Drama", "Family"],
  "Thriller": ["Action", "Mystery", "Crime"],
  "Documentary": ["Biography", "History", "Nature"],
};

export const getGenreCompatibilityScore = async (
  movieGenre: string, 
  preferredGenre: string
): Promise<{ score: number; explanation: string }> => {
  if (movieGenre.toLowerCase() === preferredGenre.toLowerCase()) {
    return { 
      score: 1, 
      explanation: `Perfect match for your preferred genre: ${preferredGenre}` 
    };
  }

  const compatibleGenres = GENRE_COMPATIBILITY[preferredGenre] || [];
  if (compatibleGenres.includes(movieGenre)) {
    return { 
      score: 0.7, 
      explanation: `Similar to your preferred genre (${preferredGenre}), featuring elements of ${movieGenre}` 
    };
  }

  return { score: 0, explanation: "" };
};