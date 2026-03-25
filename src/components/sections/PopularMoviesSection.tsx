
import { useTranslation } from "react-i18next";
import { TMDBMovie } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";
import { motion } from "framer-motion";
import { Star, Plus, Check } from "lucide-react";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
}

export const PopularMoviesSection = ({
  movies,
  isLoading = false,
}: PopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  if (!movies || movies.length === 0) {
    if (isLoading) {
      return (
        <section className="px-8 py-16 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 font-display text-white">
            Popular Movies
          </h2>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-white/5 rounded-[2rem] animate-pulse border border-white/5"
              />
            ))}
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="px-8 py-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 font-display text-white">
        Popular Movies
      </h2>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
        {movies.slice(0, 14).map((movie, idx) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.6 }}
            onClick={() => openModal(movie)}
            className="group relative rounded-[2rem] overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer shadow-2xl"
          >
            <div className="aspect-[2/3] relative overflow-hidden">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/placeholder.svg"
                }
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      <span className="text-xs font-black">
                        {movie.vote_average?.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-white/60 font-bold">
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "N/A"}
                    </span>
                  </div>
                  <button className="w-full py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all shadow-xl active:scale-95">
                    Quick View
                  </button>
                </div>
              </div>

              {/* Rating badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-xl border border-white/20 text-yellow-400 text-[10px] font-black flex items-center gap-1.5 shadow-2xl group-hover:opacity-0 transition-opacity">
                <Star className="w-3 h-3 fill-yellow-400" />{" "}
                {movie.vote_average?.toFixed(1)}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-sm font-bold text-white mb-2 truncate leading-tight">
                {movie.title} (
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "N/A"}
                )
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </section>
  );
};
