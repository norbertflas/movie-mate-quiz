import { motion, AnimatePresence } from "framer-motion";
import { MovieCard } from "@/components/MovieCard";
import { CreatorCard } from "./CreatorCard";
import type { TMDBMovie, TMDBPerson } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { tmdbFetch } from "@/services/tmdb/utils";
import { useState } from "react";

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

  const { data: creatorDetails } = useQuery({
    queryKey: ['creatorDetails', selectedCreator?.id],
    queryFn: async () => {
      if (!selectedCreator?.id) return null;
      const response = await tmdbFetch(`/person/${selectedCreator.id}?`);
      return response;
    },
    enabled: !!selectedCreator?.id
  });

  const { data: creatorMovies = [] } = useQuery({
    queryKey: ['creatorMovies', selectedCreator?.id],
    queryFn: async () => {
      if (!selectedCreator?.id) return [];
      const response = await tmdbFetch(`/person/${selectedCreator.id}/combined_credits?`);
      return response.cast
        .filter((work: any) => (work.media_type === 'movie' || work.media_type === 'tv') && work.poster_path)
        .sort((a: any, b: any) => {
          const aScore = (a.vote_average * a.vote_count * a.popularity) || 0;
          const bScore = (b.vote_average * b.vote_count * b.popularity) || 0;
          return bScore - aScore;
        })
        .slice(0, 6)
        .map((work: any) => ({
          id: work.id,
          title: work.title || work.name,
          release_date: work.release_date || work.first_air_date,
          overview: work.overview,
          poster_path: work.poster_path,
          vote_average: work.vote_average,
          genre_ids: work.genre_ids || [],
        }));
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
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground mb-4 text-center"
          >
            {t("search.clickCreatorInfo")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {creatorResults.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCreatorSelect(person)}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
              >
                <CreatorCard person={person} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {selectedCreator && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6 bg-card rounded-lg p-6 shadow-lg h-fit"
          >
            <div className="text-center">
              {selectedCreator.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w342${selectedCreator.profile_path}`}
                  alt={selectedCreator.name}
                  className="w-full rounded-lg mb-4 shadow-md"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">{selectedCreator.name[0]}</span>
                </div>
              )}
              <h2 className="text-2xl font-bold mb-2">{selectedCreator.name}</h2>
              <p className="text-muted-foreground mb-4">{selectedCreator.known_for_department}</p>
            </div>

            {creatorDetails && (
              <div className="space-y-4 text-sm">
                {creatorDetails.birthday && (
                  <div>
                    <h3 className="font-semibold text-primary">Birthday</h3>
                    <p>{new Date(creatorDetails.birthday).toLocaleDateString()}</p>
                  </div>
                )}
                {creatorDetails.place_of_birth && (
                  <div>
                    <h3 className="font-semibold text-primary">Place of Birth</h3>
                    <p>{creatorDetails.place_of_birth}</p>
                  </div>
                )}
                {creatorDetails.biography && (
                  <div>
                    <h3 className="font-semibold text-primary">Biography</h3>
                    <p className="text-sm text-muted-foreground line-clamp-6">
                      {creatorDetails.biography}
                    </p>
                  </div>
                )}
                {creatorDetails.known_for_department && (
                  <div>
                    <h3 className="font-semibold text-primary">Department</h3>
                    <p>{creatorDetails.known_for_department}</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSelectedCreator(null)}
              className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
            >
              {t("common.back")}
            </button>
          </motion.div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {creatorMovies.map((movie: TMDBMovie, index: number) => (
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
                    description={movie.overview}
                    trailerUrl=""
                    rating={movie.vote_average * 10}
                    tmdbId={movie.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
