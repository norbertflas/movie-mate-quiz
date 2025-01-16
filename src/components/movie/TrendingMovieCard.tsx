import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import type { TMDBMovie } from "@/services/tmdb";

interface TrendingMovieCardProps {
  movie: TMDBMovie;
  onClick: (movie: TMDBMovie) => void;
}

export const TrendingMovieCard = ({ movie, onClick }: TrendingMovieCardProps) => {
  return (
    <motion.div
      className="flex-none w-[300px]"
      whileHover={{ scale: 1.05 }}
      onClick={() => onClick(movie)}
      transition={{ duration: 0.2 }}
      layout
    >
      <MovieCard
        title={movie.title}
        year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
        platform="TMDB"
        genre="movie.genre"
        imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
        description={movie.overview}
        trailerUrl=""
        rating={movie.vote_average * 10}
        tmdbId={movie.id}
      />
    </motion.div>
  );
};