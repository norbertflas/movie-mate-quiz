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
import { MovieCardSwitcher } from "../movie/MovieCardSwitcher";

interface SearchResultsProps {
  searchResults: TMDBMovie[];
  creatorResults: TMDBPerson[];
  getGenreTranslationKey: (genreId: number) => string;
  streamingSearch?: any;
}

export const SearchResults = ({ 
  searchResults, 
  creatorResults, 
  getGenreTranslationKey,
  streamingSearch
}: SearchResultsProps) => {
  const { t } = useTranslation();
  const [selectedCreator, setSelectedCreator] = useState<TMDBPerson | null>(null);
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  const { data: creatorMovies = [] } = useQuery({
    queryKey: ['creatorMovies', selectedCreator?.id, isMainPage],
    queryFn: async () => {
      if (!selectedCreator?.id) return [];
      
      const creditsResponse = await tmdbFetch(`/person/${selectedCreator.id}/combined_credits?language=en`);
      
      const allWorks = [...creditsResponse.cast, ...creditsResponse.crew];
      const uniqueWorks = Array.from(new Map(allWorks.map(work => [work.id, work])).values());
      
      const sortedWorks = uniqueWorks
        .filter((work: any) => 
          (work.media_type === 'movie' || work.media_type === 'tv') && 
          work.poster_path
        )
        .sort((a: any, b: any) => {
          const aScore = ((a.vote_average || 0) * Math.log(a.vote_count || 1) * (a.popularity || 0));
          const bScore = ((b.vote_average || 0) * Math.log(b.vote_count || 1) * (b.popularity || 0));
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

  const getGenreNames = (genreIds: number[]) => {
    if (!genreIds || genreIds.length === 0) return t("movie.genres");
    
    const genreNames = genreIds
      .slice(0, 2) // Show only first 2 genres to avoid clutter
      .map(id => {
        const genreKey = getGenreTranslationKey(id);
        return t(`movie.${genreKey}`, genreKey);
      })
      .filter(name => name && name !== getGenreTranslationKey(genreIds[0]));
    
    return genreNames.length > 0 ? genreNames.join(", ") : t("movie.genres");
  };

  const getMovieDescription = (movie: any) => {
    const parts = [];
    
    if (movie.character) {
      parts.push(`${t("creator.asRole")} ${movie.character}`);
    } else if (movie.job) {
      parts.push(`${t("creator.job")}: ${movie.job}`);
    } else if (movie.department) {
      parts.push(t(`creator.department.${movie.department}`, movie.department));
    }
    
    if (movie.overview) {
      const description = parts.length > 0 ? `${parts.join(" • ")} - ` : "";
      return `${description}${movie.overview}`;
    }
    
    return parts.join(" • ") || t("movie.noDescription");
  };

  return (
    <div className="space-y-8">
      {/* Movies Section */}
      {searchResults.length > 0 && (
        <section>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            {t("search.moviesFound", { count: searchResults.length })}
          </motion.h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((movie, index) => {
              const streamingData = streamingSearch?.getStreamingData(movie.id);
              const hasStreaming = streamingSearch?.hasStreaming(movie.id);
              
              return (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="relative"
                >
                  <MovieCardSwitcher
                    title={movie.title}
                    year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : t("common.unknown")}
                    platform="TMDB"
                    genre={getGenreNames(movie.genre_ids || [])}
                    imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                    description={movie.overview || t("movie.noDescription")}
                    trailerUrl=""
                    rating={movie.vote_average * 10}
                    tmdbId={movie.id}
                    hasTrailer={Math.random() > 0.5}
                    priority={movie.popularity > 100}
                    isWatched={Math.random() > 0.7}
                    isWatchlisted={Math.random() > 0.6}
                  />
                  
                  {streamingData && hasStreaming && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ {t("streaming.availableOn")}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {creatorResults.length > 0 && !selectedCreator && (
        <section>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            {t("search.creatorsFound", { count: creatorResults.length })}
          </motion.h2>
          
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
        </section>
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
                {t("creator.filmographyTitle", { name: selectedCreator.name })}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isMainPage ? t("creator.bestMovies") : t("creator.allMovies")} 
                ({creatorMovies.length} {t("creator.moviesAndShows")})
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
                  year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : t("common.unknown")}
                  platform="TMDB"
                  genre={getGenreNames(movie.genre_ids || [])}
                  imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  description={getMovieDescription(movie)}
                  trailerUrl=""
                  rating={movie.vote_average * 10}
                  tmdbId={movie.id}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};
