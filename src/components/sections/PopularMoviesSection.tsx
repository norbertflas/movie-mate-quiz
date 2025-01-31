import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
}

export const PopularMoviesSection = ({ movies }: PopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section 
      className="space-y-4 overflow-hidden" 
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-2xl font-bold">{t("discover.popular")}</h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ y: 0 }}
        animate={{ 
          y: isHovered ? 0 : [-800, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            className="transform transition-transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
          >
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
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};