import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { useTranslation } from "react-i18next";
import { TrendingMoviesContainer } from "../movie/TrendingMoviesContainer";
import { motion } from "framer-motion";
import type { TMDBMovie } from "@/services/tmdb";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const { t } = useTranslation();
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('trending-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      id="trending-section"
      className="mb-12"
    >
      <Card className="glass-panel overflow-hidden relative">
        <CardHeader>
          <CardTitle>{t("trending.thisWeek")}</CardTitle>
        </CardHeader>

        <div 
          className="relative"
          onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
          onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
        >
          <TrendingMoviesContainer
            movies={movies}
            onMovieClick={handleMovieClick}
            isHovered={isHovered}
          />
        </div>
      </Card>

      {selectedMovie && (
        <UnifiedMovieDetails
          isOpen={!!selectedMovie}
          onClose={handleCloseDetails}
          movie={selectedMovie}
        />
      )}
    </motion.div>
  );
};