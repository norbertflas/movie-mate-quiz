
import { useTranslation } from "react-i18next";
import { MovieCardSwitcher } from "@/components/movie/MovieCardSwitcher";
import { TMDBMovie } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const { t } = useTranslation();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-white">
          {t("trending.thisWeek")}
        </h2>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide trending-horizontal-scroll">
          {movies.slice(0, 12).map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0 w-48 cursor-pointer transition-transform hover:scale-105"
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
