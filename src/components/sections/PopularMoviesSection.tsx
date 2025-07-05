
import { useTranslation } from "react-i18next";
import { MovieCardSwitcher } from "@/components/movie/MovieCardSwitcher";
import { TMDBMovie } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
}

export const PopularMoviesSection = ({ movies }: PopularMoviesSectionProps) => {
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
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-white">
          {t("popular.movies")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movies.slice(0, moviesToShow).map((movie) => (
            <div
              key={movie.id}
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => openModal(movie)}
            >
              <MovieCardSwitcher
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : ""}
                platform="TMDB"
                genre={movie.genre_ids?.join(", ") || ""}
                imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                description={movie.overview}
                trailerUrl=""
                rating={Math.round(movie.vote_average * 10)}
                initialState="minimized"
              />
            </div>
          ))}
        </div>
        
        <MovieModal movie={selectedMovie} isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  );
};
