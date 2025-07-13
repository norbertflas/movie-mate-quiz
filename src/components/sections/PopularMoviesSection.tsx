
import { useTranslation } from "react-i18next";
import { SmartMovieCard } from "@/components/movie/SmartMovieCard";
import { TMDBMovie } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
}

export const PopularMoviesSection = ({ movies, isLoading = false }: PopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();
  const [moviesToShow, setMoviesToShow] = useState(8);

  useEffect(() => {
    const updateMovieCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // Mobile: 1 column, 2 rows = 2 movies
        setMoviesToShow(2);
      } else if (width < 1024) {
        // md: 2 columns, 2 rows = 4 movies
        setMoviesToShow(4);
      } else if (width < 1280) {
        // lg: 3 columns, 2 rows = 6 movies
        setMoviesToShow(6);
      } else {
        // xl: 4 columns, 2 rows = 8 movies
        setMoviesToShow(8);
      }
    };

    updateMovieCount();
    window.addEventListener('resize', updateMovieCount);
    return () => window.removeEventListener('resize', updateMovieCount);
  }, []);

  if (!movies || movies.length === 0) {
    if (isLoading) {
      return (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              {t("popular.movies")}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2 text-foreground">
            {t("popular.movies")}
          </h2>
          <p className="text-muted-foreground mb-8">
            Najpopularniejsze filmy w tym tygodniu
          </p>
        </motion.div>
        
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {movies.slice(0, moviesToShow).map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <SmartMovieCard
                movie={movie}
                mode="instant"
                selectedServices={[]}
                onClick={() => openModal(movie)}
              />
            </motion.div>
          ))}
        </motion.div>
        
        <MovieModal movie={selectedMovie} isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  );
};
