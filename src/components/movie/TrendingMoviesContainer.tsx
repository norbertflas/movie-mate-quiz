
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
  
  return (
    <motion.div 
      className="flex space-x-6 py-4 overflow-x-auto scrollbar-hide group no-select"
      initial={{ x: 0 }}
      animate={{ 
        x: isMobile ? 0 : (isHovered ? 0 : [-1000, 0])
      }}
      transition={{ 
        duration: 30,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop"
      }}
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
