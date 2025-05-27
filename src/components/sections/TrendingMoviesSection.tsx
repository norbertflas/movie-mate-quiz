
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import type { TMDBMovie } from "@/services/tmdb";
import { TrendingMoviesContainer } from "../movie/TrendingMoviesContainer";
import { useTranslation } from "react-i18next";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  const handleMovieClick = (movie: TMDBMovie) => {
    try {
      setSelectedMovie(movie);
    } catch (err) {
      console.error('Error selecting movie:', err);
      setError('Failed to select movie');
    }
  };

  const handleCloseDetails = () => {
    try {
      setSelectedMovie(null);
    } catch (err) {
      console.error('Error closing details:', err);
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" 
      }
    }
  };

  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-red-500">
          Error loading trending movies
        </h2>
        <p className="text-muted-foreground">{error}</p>
      </section>
    );
  }

  return (
    <section 
      ref={ref}
      className={`space-y-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-center space-x-2">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={titleVariants}
        >
          {t("discover.trending") || "Trending This Week"}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
        >
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
        </motion.div>
      </div>
      
      <div 
        className="overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm p-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {movies && movies.length > 0 ? (
          <TrendingMoviesContainer 
            movies={movies} 
            onMovieClick={handleMovieClick} 
            isHovered={isHovered}
          />
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            {t("discover.noMoviesFound") || "No movies found"}
          </div>
        )}
      </div>

      <UnifiedMovieDetails
        isOpen={!!selectedMovie}
        onClose={handleCloseDetails}
        movie={selectedMovie}
        explanations={selectedMovie?.explanations}
      />
    </section>
  );
};
