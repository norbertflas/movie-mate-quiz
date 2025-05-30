
import { MovieCardSwitcher } from "@/components/movie/MovieCardSwitcher";
import { TMDBMovie } from "@/services/tmdb";
import { LoadingState } from "@/components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface UnifiedMovieSectionProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  title: string;
  subtitle?: string;
}

// Genre mapping for translation
const genreMapping: Record<number, string> = {
  28: 'Action',
  12: 'Adventure', 
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

export const UnifiedMovieSection = ({ 
  movies, 
  isLoading, 
  title, 
  subtitle 
}: UnifiedMovieSectionProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('unified-movie-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const getGenreNames = (genreIds: number[]): string => {
    if (!genreIds || genreIds.length === 0) return '';
    return genreIds
      .slice(0, 2) // Show max 2 genres
      .map(id => genreMapping[id] || 'Unknown')
      .join(', ');
  };

  if (isLoading && (!movies || movies.length === 0)) {
    return <LoadingState message="Loading movies..." />;
  }

  return (
    <div className="space-y-6" id="unified-movie-section">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Movies Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {movies.slice(0, 18).map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MovieCardSwitcher
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                  platform="TMDB"
                  genre={getGenreNames(movie.genre_ids || [])}
                  imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                  description={movie.overview}
                  trailerUrl=""
                  rating={movie.vote_average * 10}
                  tmdbId={movie.id}
                  hasTrailer={Math.random() > 0.6}
                  priority={movie.popularity > 100}
                  isWatched={false}
                  isWatchlisted={false}
                  initialState="minimized"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show more button if there are more movies */}
      {movies.length > 18 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
            {t('common.showMore')} ({movies.length - 18} more)
          </button>
        </motion.div>
      )}
    </div>
  );
};
