
import { motion } from "framer-motion";
import { useState } from "react";
import type { TMDBMovie } from "@/services/tmdb";
import { TrendingMoviesContainer } from "../movie/TrendingMoviesContainer";
import { useTranslation } from "react-i18next";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gradient">{t("discover.trending")}</h2>
      
      <motion.div 
        className="overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm p-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {movies && movies.length > 0 ? (
          <TrendingMoviesContainer 
            movies={movies} 
            onMovieClick={handleMovieClick} 
            isHovered={isHovered}
          />
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            {t("discover.noMoviesFound")}
          </div>
        )}
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
