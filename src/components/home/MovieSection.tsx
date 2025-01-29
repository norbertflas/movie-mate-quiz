import { MovieCard } from "@/components/MovieCard";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { TMDBMovie } from "@/services/tmdb";
import { LoadingState } from "@/components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface MovieSectionProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  onFilterChange: (filters: MovieFiltersType) => void;
}

export const MovieSection = ({ movies, isLoading, onFilterChange }: MovieSectionProps) => {
  const [expandedMovieId, setExpandedMovieId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('movie-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const handleMovieClose = () => {
    setExpandedMovieId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6" id="movie-section">
      <aside className="w-full lg:w-64">
        <MovieFilters onFilterChange={onFilterChange} />
      </aside>
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MovieCard
                    key={movie.id}
                    title={movie.title}
                    year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                    platform="TMDB"
                    genre="Film"
                    imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    description={movie.overview}
                    trailerUrl=""
                    rating={movie.vote_average * 10}
                    onClose={handleMovieClose}
                    tmdbId={movie.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};