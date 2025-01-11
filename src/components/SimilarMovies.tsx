import { MovieCard } from "./MovieCard";
import { SAMPLE_RECOMMENDATIONS } from "./quiz/QuizConstants";
import type { MovieRecommendation } from "./quiz/QuizTypes";

interface SimilarMoviesProps {
  currentMovie: MovieRecommendation;
}

export const SimilarMovies = ({ currentMovie }: SimilarMoviesProps) => {
  const getSimilarMovies = () => {
    return SAMPLE_RECOMMENDATIONS
      .filter(movie => 
        movie.title !== currentMovie.title && 
        (movie.genre === currentMovie.genre || 
         movie.tags?.some(tag => currentMovie.tags?.includes(tag)))
      )
      .slice(0, 3);
  };

  const similarMovies = getSimilarMovies();

  return similarMovies.length > 0 ? (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Podobne tytuły</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {similarMovies.map((movie) => (
          <MovieCard key={movie.title} {...movie} />
        ))}
      </div>
    </div>
  ) : null;
};