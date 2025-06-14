
import { motion, useInView } from "framer-motion";
import { MovieCard } from "../MovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp } from "lucide-react";
import { MovieCardSwitcher } from "../movie/MovieCardSwitcher";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
}

export const PopularMoviesSection = ({ movies }: PopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const isMobile = useIsMobile();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      rotateX: isMobile ? 0 : -10
    },
    visible: { 
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 0.8
      }
    }
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
    <section className="space-y-6 overflow-hidden py-8" ref={ref}>
      <div className="flex items-center space-x-2">
        <motion.h2 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={titleVariants}
        >
          {t("discover.popular")}
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
          <TrendingUp className="h-5 w-5 text-blue-400 animate-pulse" />
        </motion.div>
      </div>
      
      {movies && movies.length > 0 ? (
        <motion.div 
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 md:gap-3"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            gridTemplateColumns: isMobile 
              ? 'repeat(3, minmax(0, 1fr))' 
              : 'repeat(auto-fill, minmax(180px, 1fr))'
          }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={`movie-${movie.id}-${index}`}
              variants={cardVariants}
              custom={index}
              className="transform-gpu h-full"
            >
              <motion.div
                whileHover={{ 
                  scale: 1.03, 
                  transition: { duration: 0.2 },
                  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)" 
                }}
                className="h-full flex"
              >
                <MovieCardSwitcher
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                  platform="TMDB"
                  genre={t("movie.genre")}
                  imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                  description={movie.overview}
                  trailerUrl=""
                  rating={movie.vote_average * 10}
                  tmdbId={movie.id}
                  streamingServices={[]}
                  tags={[]}
                  hasTrailer={Math.random() > 0.5}
                  priority={movie.popularity > 100}
                  isWatched={Math.random() > 0.8}
                  isWatchlisted={Math.random() > 0.7}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-6 text-center text-muted-foreground rounded-lg bg-muted/30 border border-muted">
          {t("discover.noMoviesFound")}
        </div>
      )}
    </section>
  );
};
