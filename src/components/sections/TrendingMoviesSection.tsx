
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import type { TMDBMovie } from "@/services/tmdb";
import { TrendingMoviesContainer } from "../movie/TrendingMoviesContainer";
import { useTranslation } from "react-i18next";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";

interface TrendingMoviesSectionProps {
  movies: TMDBMovie[];
}

export const TrendingMoviesSection = ({ movies }: TrendingMoviesSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [50, 0, 0, 50]);

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" 
      }
    }
  };

  return (
    <motion.section 
      ref={ref}
      className="space-y-4"
      style={{ opacity, y }}
    >
      <div className="flex items-center space-x-2">
        <motion.h2 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={titleVariants}
        >
          {t("discover.trending")}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
        >
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
        </motion.div>
      </div>
      
      <motion.div 
        className="overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm p-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
    </motion.section>
  );
};
