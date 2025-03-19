
import { motion } from "framer-motion";
import type { TMDBMovie } from "@/services/tmdb";
import { TrendingMovieCard } from "./TrendingMovieCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrendingMoviesContainerProps {
  movies: TMDBMovie[];
  onMovieClick: (movie: TMDBMovie) => void;
  isHovered: boolean;
}

export const TrendingMoviesContainer = ({ 
  movies, 
  onMovieClick,
  isHovered 
}: TrendingMoviesContainerProps) => {
  const isMobile = useIsMobile();
  
  if (!movies || movies.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Brak filmów do wyświetlenia
      </div>
    );
  }
  
  return (
    <motion.div 
      className="flex space-x-4 py-4 overflow-x-auto scrollbar-hide group no-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {movies.slice(0, 10).map((movie) => (
        <TrendingMovieCard
          key={movie.id}
          movie={movie}
          onClick={onMovieClick}
        />
      ))}
    </motion.div>
  );
};
