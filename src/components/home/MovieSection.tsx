import { MovieCard } from "@/components/MovieCard";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { TMDBMovie } from "@/services/tmdb";
import { LoadingState } from "@/components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface MovieSectionProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  onFilterChange: (filters: MovieFiltersType) => void;
}

export const MovieSection = ({ movies, isLoading, onFilterChange }: MovieSectionProps) => {
  const [expandedMovieId, setExpandedMovieId] = useState<number | null>(null);

  const handleMovieClose = () => {
    setExpandedMovieId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
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
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
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