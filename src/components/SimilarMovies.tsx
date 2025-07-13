import { useQuery } from "@tanstack/react-query";
import { MovieCard } from "./MovieCard";
import { getMovieRecommendations, type TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface SimilarMoviesProps {
  currentMovie: {
    title: string;
    year: string;
    genre: string;
    tags?: string[];
    tmdbId: number;
  };
  onMovieSelect?: (movie: TMDBMovie) => void;
}

export const SimilarMovies = ({ currentMovie, onMovieSelect }: SimilarMoviesProps) => {
  const { t } = useTranslation();
  
  const { data: similarMovies = [], isLoading } = useQuery({
    queryKey: ['similarMovies', currentMovie.tmdbId],
    queryFn: () => getMovieRecommendations(currentMovie.tmdbId),
    enabled: !!currentMovie.tmdbId,
  });

  if (isLoading || similarMovies.length === 0) return null;

  const handleMovieClick = (movie: TMDBMovie) => {
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <h3 className="text-xl font-semibold mb-4">{t("similarMovies")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarMovies.slice(0, 3).map((movie: TMDBMovie) => (
          <div key={movie.id} onClick={() => handleMovieClick(movie)}>
            <MovieCard
              title={movie.title}
              year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre={t("movie.genre")}
              imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              description={movie.overview}
              trailerUrl=""
              rating={movie.vote_average * 10}
              tmdbId={movie.id}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};