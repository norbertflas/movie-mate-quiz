import { useState } from "react";
import { MovieCard } from "../MovieCard";
import { motion } from "framer-motion";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";
import type { TMDBMovie } from "@/services/tmdb";

interface QuizResultsProps {
  recommendations: any[];
  isGroupQuiz?: boolean;
}

export const QuizResults = ({ recommendations, isGroupQuiz = false }: QuizResultsProps) => {
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleMovieClick(movie)}
          >
            <MovieCard
              title={movie.title}
              year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre={movie.genres?.[0]?.name || "Film"}
              imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              description={movie.overview}
              trailerUrl=""
              rating={movie.vote_average * 10}
              tmdbId={movie.id}
              explanations={movie.explanations}
            />
          </motion.div>
        ))}
      </div>

      <UnifiedMovieDetails
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        movie={selectedMovie}
        explanations={selectedMovie?.explanations}
      />
    </div>
  );
};