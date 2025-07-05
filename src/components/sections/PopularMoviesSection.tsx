
import { useTranslation } from "react-i18next";
import { MovieCardSwitcher } from "@/components/movie/MovieCardSwitcher";
import { TMDBMovie } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
}

export const PopularMoviesSection = ({ movies }: PopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

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
          {movies.slice(0, 8).map((movie) => (
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
