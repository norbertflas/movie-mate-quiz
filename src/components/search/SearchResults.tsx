
import { motion, AnimatePresence } from "framer-motion";
import { MovieCard } from "@/components/MovieCard";
import { CreatorCard } from "./CreatorCard";
import type { TMDBMovie, TMDBPerson } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { tmdbFetch } from "@/services/tmdb/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

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
  const [selectedCreator, setSelectedCreator] = useState<TMDBPerson | null>(null);
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  const { data: creatorMovies = [] } = useQuery({
    queryKey: ['creatorMovies', selectedCreator?.id],
    queryFn: async () => {
      if (!selectedCreator?.id) return [];
      
      const creditsResponse = await tmdbFetch(`/person/${selectedCreator.id}/combined_credits?`);
      
      const allWorks = [...creditsResponse.cast, ...creditsResponse.crew];
      const uniqueWorks = Array.from(new Map(allWorks.map(work => [work.id, work])).values());
      
      const sortedWorks = uniqueWorks
        .filter((work: any) => 
          (work.media_type === 'movie' || work.media_type === 'tv') && 
          work.poster_path
        )
        .sort((a: any, b: any) => {
          const aScore = (a.vote_average * a.vote_count * a.popularity) || 0;
          const bScore = (b.vote_average * b.vote_count * b.popularity) || 0;
          return bScore - aScore;
        })
        .map((work: any) => ({
          id: work.id,
          title: work.title || work.name,
          release_date: work.release_date || work.first_air_date,
          overview: work.overview,
          poster_path: work.poster_path,
          vote_average: work.vote_average,
          genre_ids: work.genre_ids || [],
          character: work.character,
          job: work.job,
          department: work.department
        }));

      return isMainPage ? sortedWorks.slice(0, 6) : sortedWorks;
    },
    enabled: !!selectedCreator?.id
  });

  const handleCreatorSelect = (person: TMDBPerson) => {
    setSelectedCreator(person);
  };

  return (
    <AnimatePresence mode="wait">
      {searchResults.length > 0 && !selectedCreator && (
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
                rating={movie.vote_average * 10}
                tmdbId={movie.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {creatorResults.length > 0 && !selectedCreator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-6"
        >
          {creatorResults.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CreatorCard 
                person={person} 
                index={index} 
                onClick={() => handleCreatorSelect(person)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedCreator && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                {isMainPage ? t("creator.bestWorks") : t("creator.filmography")}
              </h2>
              <p className="text-muted-foreground mt-2">
                {creatorMovies.length} {t("creator.moviesAndShows")}
              </p>
            </div>
            <Button
              onClick={() => setSelectedCreator(null)}
              variant="outline"
              className="hover:bg-primary/10"
            >
              {t("common.back")}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {creatorMovies.map((movie: any, index: number) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <MovieCard
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                  platform="TMDB"
                  genre={t(`movie.${getGenreTranslationKey(movie.genre_ids?.[0] || 0)}`)}
                  imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  description={`${movie.character ? `${t("creator.asRole")} ${movie.character}` : movie.job ? `${movie.job}` : movie.department} - ${movie.overview}`}
                  trailerUrl=""
                  rating={movie.vote_average * 10}
                  tmdbId={movie.id}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
