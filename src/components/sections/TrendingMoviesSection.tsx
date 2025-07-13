
import { useTranslation } from "react-i18next";
import { SmartMovieCard } from "@/components/movie/SmartMovieCard";
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
            <div key={movie.id} className="flex-shrink-0 w-48">
              <SmartMovieCard
                movie={movie}
                mode="lazy"
                selectedServices={[]}
                onClick={() => openModal(movie)}
              />
            </div>
          ))}
        </div>
        
        <MovieModal movie={selectedMovie} isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  );
};
