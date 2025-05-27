
import { motion } from "framer-motion";
import { UnifiedMovieCard } from "./UnifiedMovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrendingMovieCardProps {
  movie: TMDBMovie;
  onClick: (movie: TMDBMovie) => void;
}

// Convert TMDB movie to our Movie interface
const convertTMDBMovie = (tmdbMovie: TMDBMovie) => ({
  id: tmdbMovie.id,
  title: tmdbMovie.title,
  poster_path: tmdbMovie.poster_path,
  backdrop_path: tmdbMovie.backdrop_path,
  overview: tmdbMovie.overview,
  release_date: tmdbMovie.release_date,
  vote_average: tmdbMovie.vote_average,
  runtime: undefined,
  genres: undefined,
  cast: undefined,
  director: undefined,
  trailer_url: undefined
});

export const TrendingMovieCard = ({ movie, onClick }: TrendingMovieCardProps) => {
  const isMobile = useIsMobile();
  
  if (!movie) return null;
  
  const convertedMovie = convertTMDBMovie(movie);
  
  return (
    <motion.div
      className={`flex-none ${isMobile ? "w-[140px]" : "w-[220px]"}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <UnifiedMovieCard
        movie={convertedMovie}
        variant={isMobile ? "small" : "medium"}
        onExpand={() => onClick(movie)}
        showExpandButton={true}
      />
    </motion.div>
  );
};
