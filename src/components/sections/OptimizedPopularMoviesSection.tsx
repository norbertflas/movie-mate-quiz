
import { motion, useInView } from "framer-motion";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useRef, useState, useCallback, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp } from "lucide-react";
import { VirtualizedMovieGrid } from "../movie/VirtualizedMovieGrid";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";

interface OptimizedPopularMoviesSectionProps {
  movies: TMDBMovie[];
}

export const OptimizedPopularMoviesSection = memo(({ movies }: OptimizedPopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const isMobile = useIsMobile();
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  const handleMovieClick = useCallback((movie: TMDBMovie) => {
    setSelectedMovie(movie);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedMovie(null);
  }, []);

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

  return (
    <section className="space-y-6 overflow-hidden py-8" ref={ref}>
      <div className="flex items-center space-x-2">
        <motion.h2 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={titleVariants}
        >
          {t("discover.popular")}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
        >
          <TrendingUp className="h-5 w-5 text-blue-400 animate-pulse" />
        </motion.div>
      </div>
      
      {movies && movies.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <VirtualizedMovieGrid 
            movies={movies}
            onMovieClick={handleMovieClick}
            className="w-full"
          />
        </motion.div>
      ) : (
        <div className="py-6 text-center text-muted-foreground rounded-lg bg-muted/30 border border-muted">
          {t("discover.noMoviesFound")}
        </div>
      )}

      <UnifiedMovieDetails
        isOpen={!!selectedMovie}
        onClose={handleCloseDetails}
        movie={selectedMovie}
        explanations={selectedMovie?.explanations}
      />
    </section>
  );
});

OptimizedPopularMoviesSection.displayName = "OptimizedPopularMoviesSection";
