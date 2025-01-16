import { motion, AnimatePresence } from "framer-motion";
import { MovieCard } from "@/components/MovieCard";
import { CreatorCard } from "./CreatorCard";
import type { TMDBMovie, TMDBPerson } from "@/services/tmdb";
import { useTranslation } from "react-i18next";

interface SearchResultsProps {
  searchResults: TMDBMovie[];
  creatorResults: TMDBPerson[];
  getGenreTranslationKey: (genreId: number) => string;
}

export const SearchResults = ({ 
  searchResults, 
  creatorResults, 
  getGenreTranslationKey 
}: SearchResultsProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence mode="wait">
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {searchResults.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MovieCard
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                platform="TMDB"
                genre={t(`movie.${getGenreTranslationKey(movie.genre_ids?.[0] || 0)}`)}
                imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                description={movie.overview}
                trailerUrl={`https://www.youtube.com/watch?v=${movie.video_id || ''}`}
                rating={movie.vote_average}
                tmdbId={movie.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {creatorResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {creatorResults.map((person, index) => (
            <CreatorCard key={person.id} person={person} index={index} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};