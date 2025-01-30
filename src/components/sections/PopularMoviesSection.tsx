import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface PopularMoviesSectionProps {
  movies: TMDBMovie[];
}

export const PopularMoviesSection = ({ movies }: PopularMoviesSectionProps) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="space-y-4" ref={ref}>
      <h2 className="text-2xl font-bold">{t("discover.popular")}</h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ 
          duration: 0.5,
          staggerChildren: 0.1
        }}
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1
            }}
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