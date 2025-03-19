
import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrendingMovieCardProps {
  movie: TMDBMovie;
  onClick: (movie: TMDBMovie) => void;
}

export const TrendingMovieCard = ({ movie, onClick }: TrendingMovieCardProps) => {
  const isMobile = useIsMobile();
  
  if (!movie) return null;
  
  return (
    <motion.div
      className={`flex-none ${isMobile ? "w-[140px]" : "w-[220px]"}`}
      whileHover={{ scale: 1.05 }}
      onClick={() => onClick(movie)}
      transition={{ duration: 0.2 }}
      layout
    >
      <MovieCard
        title={movie.title}
        year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
        platform="TMDB"
        genre=""
        imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
        description=""
        trailerUrl=""
        rating={movie.vote_average * 10}
        tmdbId={movie.id}
      />
    </motion.div>
  );
};
