
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ProMovieCard } from "@/components/movie/ProMovieCard";
import { CreatorCard } from "./CreatorCard";
import { useSmartStreamingSearch } from "@/hooks/use-smart-streaming-search";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Film, User } from "lucide-react";
import { type TMDBMovie, type TMDBPerson } from "@/services/tmdb";
import { MovieModal, useMovieModal } from "../movie/MovieModal";

interface SmartSearchResultsProps {
  searchResults: TMDBMovie[];
  creatorResults: TMDBPerson[];
  getGenreTranslationKey: (genreId: number) => string;
  selectedServices: string[];
  mode?: 'instant' | 'lazy';
  country?: string;
}

export const SmartSearchResults = ({
  searchResults,
  creatorResults,
  getGenreTranslationKey,
  selectedServices,
  mode = 'instant',
  country = 'us'
}: SmartSearchResultsProps) => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  // Smart streaming search for movie results
  const streamingSearch = useSmartStreamingSearch(
    searchResults.map(m => m.id),
    {
      mode,
      selectedServices,
      country,
      enabled: searchResults.length > 0,
      autoFetch: true
    }
  );

  // Filter movies by streaming availability if services are selected
  const filteredMovies = useMemo(() => {
    if (selectedServices.length === 0) return searchResults;

    return searchResults.filter(movie => {
      const streamingData = streamingSearch.getStreamingData(movie.id);
      if (!streamingData) return mode === 'lazy'; // Include in lazy mode for potential fetch
      
      return selectedServices.some(serviceId =>
        streamingData.availableServices.some(available =>
          available.toLowerCase().includes(serviceId.toLowerCase()) ||
          serviceId.toLowerCase().includes(available.toLowerCase())
        )
      );
    });
  }, [searchResults, selectedServices, streamingSearch, mode]);

  const handleFavorite = (movieId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(movieId)) {
        newFavorites.delete(movieId);
      } else {
        newFavorites.add(movieId);
      }
      return newFavorites;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Show streaming stats for movies
  const showStreamingStats = searchResults.length > 0 && streamingSearch.stats.total > 0;

  return (
    <div className="space-y-6">
      {/* Streaming availability stats */}
      {showStreamingStats && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {filteredMovies.length} movies found
                  </span>
                </div>
                
                {streamingSearch.stats.withStreaming > 0 && (
                  <Badge variant="secondary" className="bg-green-600/20 text-green-600 border-green-600/30">
                    {streamingSearch.stats.withStreaming} available for streaming
                  </Badge>
                )}
                
                {selectedServices.length > 0 && (
                  <Badge variant="outline">
                    Filtered by {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {streamingSearch.loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Checking availability...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movie Results */}
      {filteredMovies.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Film className="h-5 w-5" />
            Movies ({filteredMovies.length})
          </h3>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
          >
            {filteredMovies.map((movie) => (
              <motion.div key={movie.id} variants={itemVariants}>
                <ProMovieCard
                  title={movie.title}
                  year={movie.release_date}
                  imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                  description={movie.overview}
                  rating={(movie.vote_average || 0) * 10}
                  tmdbId={movie.id}
                  mode={mode}
                  showStreamingBadges={mode === 'instant'}
                  onClick={() => openModal(movie)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Creator Results */}
      {creatorResults.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            People ({creatorResults.length})
          </h3>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {creatorResults.map((creator, index) => (
              <motion.div key={creator.id} variants={itemVariants}>
                <CreatorCard person={creator} index={index} onClick={() => {}} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {filteredMovies.length === 0 && creatorResults.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Film className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Results Found</h3>
              <p className="text-muted-foreground">
                {selectedServices.length > 0 
                  ? "Try adjusting your streaming service filters or search terms."
                  : "Try different search terms or check back later."
                }
              </p>
            </div>
          </div>
        </Card>
      )}
      
      <MovieModal movie={selectedMovie} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};
