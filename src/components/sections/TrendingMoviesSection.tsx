
import { useTranslation } from "react-i18next";
import { ProMovieCard } from "@/components/movie/ProMovieCard";
import { TMDBMovie } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";
import { motion } from "framer-motion";
import { ArrowRight, Star, Plus, Check } from "lucide-react";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const { t } = useTranslation();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  if (!movies || movies.length === 0) return null;

  return (
    <section className="px-8 py-16 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-bold font-display text-white">
          Trending Now
        </h2>
        <button className="text-purple-400 font-bold flex items-center gap-2 hover:text-purple-300 transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {movies.slice(0, 8).map((movie, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={movie.id}
            onClick={() => openModal(movie)}
            className="group relative rounded-[3rem] overflow-hidden glass-card aspect-[3/4] cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.2)]"
          >
            {/* Trending badge */}
            <div className="absolute top-6 left-6 z-20">
              <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2.5 shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                Trending
              </div>
            </div>

            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/placeholder.svg"
              }
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
              referrerPolicy="no-referrer"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-[#02020a]/40 to-transparent opacity-90 group-hover:opacity-100 transition-all duration-700" />

            <div className="absolute bottom-0 left-0 right-0 p-10 z-20 transform translate-y-6 group-hover:translate-y-0 transition-all duration-700 ease-out">
              {/* Genres on hover */}
              <div className="flex flex-wrap gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform translate-y-4 group-hover:translate-y-0">
                {movie.genre_ids?.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black text-white/80 uppercase tracking-widest"
                  >
                    Genre
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl lg:text-3xl font-black font-display tracking-tighter leading-none group-hover:text-purple-400 transition-colors text-white">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-yellow-400 text-xs font-black shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />{" "}
                  {movie.vote_average?.toFixed(1)}
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/40 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
                <span>
                  {movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : "N/A"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="text-purple-400/60">Movie</span>
              </div>

              {/* Expandable description on hover */}
              <div className="max-h-0 group-hover:max-h-32 overflow-hidden transition-all duration-700 ease-out opacity-0 group-hover:opacity-100">
                <p className="text-xs text-white/40 leading-relaxed mb-8 line-clamp-3 font-light">
                  {movie.overview}
                </p>
                <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-2xl shadow-white/5">
                  View Experience
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <MovieModal movie={selectedMovie} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
};
