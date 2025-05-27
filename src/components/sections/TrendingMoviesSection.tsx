
import { motion } from "framer-motion";
import { useState } from "react";
import type { TMDBMovie } from "@/services/tmdb";
import { MovieCardSwitcher } from "../movie/MovieCardSwitcher";
import { useTranslation } from "react-i18next";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  console.log('TrendingMoviesSection rendering with movies count:', movies?.length || 0);

  const handleMovieClick = (movie: TMDBMovie) => {
    try {
      console.log('Movie clicked:', movie.title);
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
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-red-500">
          Error loading trending movies
        </h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          {t("discover.trending") || "Trending This Week"}
        </h2>
        <div className="py-4 text-center text-muted-foreground">
          {t("discover.noMoviesFound") || "No movies found"}
        </div>
      </div>
    );
  }

  try {
    // Animation speed based on hover state
    const animationDuration = isHovered ? 20 : 60;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500"
            initial="hidden"
            animate="visible"
            variants={titleVariants}
          >
            {t("discover.trending") || "Trending This Week"}
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
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          </motion.div>
        </div>
        
        <div 
          className="overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm p-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div 
            className="relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.05 }}
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
              {[...movies, ...movies].map((movie, index) => {
                if (!movie || !movie.id) {
                  console.warn('Invalid movie data at index:', index);
                  return null;
                }

                return (
                  <motion.div
                    key={`${movie.id}-${index}`}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-none"
                  >
                    <div className={`${isMobile ? "w-[140px]" : "w-[220px]"}`}>
                      <MovieCardSwitcher
                        title={movie.title || "Unknown Movie"}
                        year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                        platform="TMDB"
                        genre=""
                        imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                        description={movie.overview || ""}
                        trailerUrl=""
                        rating={movie.vote_average ? movie.vote_average * 10 : 0}
                        tmdbId={movie.id}
                        onClick={() => handleMovieClick(movie)}
                        hasTrailer={Math.random() > 0.5}
                        priority={movie.popularity > 100}
                        isWatched={Math.random() > 0.8}
                        isWatchlisted={Math.random() > 0.7}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            
            {/* Fade edges for smooth transitions */}
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </motion.div>
        </div>

        <UnifiedMovieDetails
          isOpen={!!selectedMovie}
          onClose={handleCloseDetails}
          movie={selectedMovie}
          explanations={selectedMovie?.explanations}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in TrendingMoviesSection:', error);
    return (
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-red-500">
          Error in trending section
        </h2>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }
};
