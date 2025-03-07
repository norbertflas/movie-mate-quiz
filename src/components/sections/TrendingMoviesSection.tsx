
import { motion } from "framer-motion";
import { useState } from "react";
import type { TMDBMovie } from "@/services/tmdb";
import { TrendingMovieCard } from "../movie/TrendingMovieCard";
import { useTranslation } from "react-i18next";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const { t } = useTranslation();

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{t("discover.trending")}</h2>
      <motion.div 
        className="overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          className="flex space-x-6 py-4 overflow-x-auto scrollbar-hide"
          initial={{ x: 0 }}
          animate={{ 
            x: isHovered ? 0 : [-1000, 0]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop"
          }}
        >
          {movies.map((movie) => (
            <TrendingMovieCard
              key={movie.id}
              movie={movie}
              onClick={handleMovieClick}
            />
          ))}
        </motion.div>
      </motion.div>

      <UnifiedMovieDetails
        isOpen={!!selectedMovie}
        onClose={handleCloseDetails}
        movie={selectedMovie}
        explanations={selectedMovie?.explanations}
      />
    </section>
  );
};
