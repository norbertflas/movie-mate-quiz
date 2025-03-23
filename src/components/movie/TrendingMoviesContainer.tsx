
import { motion } from "framer-motion";
import type { TMDBMovie } from "@/services/tmdb";
import { TrendingMovieCard } from "./TrendingMovieCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  if (!movies || movies.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("discover.noMoviesFound")}
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

  // Set animation speed based on hover state
  const animationDuration = isHovered ? 20 : 60;
  
  return (
    <motion.div 
      className="relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex space-x-4 py-4 overflow-x-auto scrollbar-hide group no-select"
        animate={{ 
          x: [0, isMobile ? -1200 : -2000]
        }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "loop",
          duration: animationDuration, 
          ease: "linear",
        }}
        style={{ 
          width: "fit-content"
        }}
      >
        {/* Duplicate the movies to create a seamless infinite scroll */}
        {[...movies, ...movies].map((movie, index) => (
          <motion.div
            key={`${movie.id}-${index}`}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            className="flex-none"
          >
            <TrendingMovieCard
              movie={movie}
              onClick={onMovieClick}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Fade edges for smooth transitions */}
      <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
    </motion.div>
  );
};
