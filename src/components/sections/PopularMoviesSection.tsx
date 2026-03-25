
import { useTranslation } from "react-i18next";
import { ProMovieCard } from "@/components/movie/ProMovieCard";
import { TMDBMovie } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";
import { motion } from "framer-motion";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
}

export const PopularMoviesSection = ({ movies, isLoading = false }: PopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  if (!movies || movies.length === 0) {
    if (isLoading) {
      return (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-foreground">⭐ Popular Movies</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-foreground">⭐ Popular Movies</h2>
        
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          {movies.slice(0, 14).map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <ProMovieCard
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                description={movie.overview}
                rating={(movie.vote_average || 0) * 10}
                tmdbId={movie.id}
                mode="lazy"
                showStreamingBadges={false}
                onClick={() => openModal(movie)}
              />
            </motion.div>
          ))}
        </div>
        
        <MovieModal movie={selectedMovie} isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  );
};
