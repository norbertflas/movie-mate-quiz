
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
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  return (
    <motion.div 
      className="flex space-x-4 py-4 overflow-x-auto scrollbar-hide group no-select"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {movies.slice(0, 10).map((movie, index) => (
        <motion.div
          key={movie.id}
          variants={cardVariants}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <TrendingMovieCard
            movie={movie}
            onClick={onMovieClick}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
