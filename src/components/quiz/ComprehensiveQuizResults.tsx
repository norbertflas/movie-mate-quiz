import { ModernMovieRecommendations } from "./ModernMovieRecommendations";
import type { MovieRecommendation, QuizPreferences } from "./types/comprehensiveQuizTypes";
import type { Movie } from "@/types/movie";

interface ComprehensiveQuizResultsProps {
  recommendations: MovieRecommendation[];
  preferences: QuizPreferences;
  onRetakeQuiz: () => void;
}

export const ComprehensiveQuizResults = ({ 
  recommendations, 
  preferences, 
  onRetakeQuiz 
}: ComprehensiveQuizResultsProps) => {
  // Convert MovieRecommendation[] to Movie[] for the modern component
  const convertedMovies: Movie[] = recommendations.map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster.replace('https://image.tmdb.org/t/p/w500', ''),
    backdrop_path: movie.poster.replace('https://image.tmdb.org/t/p/w500', '').replace('w500', 'w1280'),
    overview: movie.overview,
    release_date: `${movie.year}-01-01`,
    vote_average: movie.rating,
    runtime: undefined,
    genres: movie.genres.map(genre => ({ id: 0, name: genre })),
    cast: [],
    director: undefined,
    trailer_url: undefined,
    tmdbId: movie.id,
    genre: movie.genres[0] || 'Unknown',
    vote_count: 0,
    popularity: 0
  }));

  // Create quiz results summary
  const quizResults = {
    genres: preferences.genres,
    mood: "Personalized for you",
    era: preferences.era || "All time favorites",
    platforms: preferences.platforms.length,
    totalFound: recommendations.length
  };

  return (
    <ModernMovieRecommendations 
      movies={convertedMovies}
      quizResults={quizResults}
    />
  );
};