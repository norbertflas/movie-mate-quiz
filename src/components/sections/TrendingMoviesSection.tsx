
import { motion } from "framer-motion";
import { useState } from "react";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { UnifiedMovieCard, MovieModal, useMovieModal } from "@/components/movie/UnifiedMovieCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  console.log('TrendingMoviesSection rendering with movies count:', movies?.length || 0);

  const handleMovieClick = (movie: TMDBMovie) => {
    try {
      console.log('Movie clicked:', movie.title);
      const convertedMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        runtime: undefined,
        genres: undefined,
        cast: undefined,
        director: undefined,
        trailer_url: undefined
      };
      openModal(convertedMovie);
    } catch (err) {
      console.error('Error selecting movie:', err);
      setError('Failed to select movie');
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
      <>
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
                className="flex gap-2 py-4 overflow-x-auto scrollbar-hide group no-select"
                animate={{ 
                  x: [0, isMobile ? -1400 : -2600]
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
                      <div className={`${isMobile ? "w-[140px]" : "w-[200px]"}`}>
                        <UnifiedMovieCard
                          movie={{
                            id: movie.id,
                            title: movie.title || "Unknown Movie",
                            poster_path: movie.poster_path,
                            backdrop_path: movie.backdrop_path,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            vote_average: movie.vote_average,
                            runtime: undefined,
                            genres: undefined,
                            cast: undefined,
                            director: undefined,
                            trailer_url: undefined
                          }}
                          onExpand={() => handleMovieClick(movie)}
                          variant={isMobile ? "small" : "medium"}
                          showExpandButton={true}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
              
              {/* Fade edges for smooth transitions */}
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
              <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            </motion.div>
          </div>
        </div>

        {/* Movie Modal */}
        <MovieModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </>
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
