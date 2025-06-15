
import { useState, useMemo } from "react";
import { SmartMovieCard } from "@/components/movie/SmartMovieCard";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { StreamingServiceSelector } from "@/components/streaming/StreamingServiceSelector";
import { TMDBMovie } from "@/services/tmdb";
import { LoadingState } from "@/components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSmartStreamingSearch } from "@/hooks/use-smart-streaming-search";
import { Filter, Loader2 } from "lucide-react";

interface SmartMovieSectionProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  onFilterChange: (filters: MovieFiltersType) => void;
  title?: string;
  mode?: 'instant' | 'lazy';
}

export const SmartMovieSection = ({ 
  movies, 
  isLoading, 
  onFilterChange,
  title = "Movies",
  mode = 'lazy'
}: SmartMovieSectionProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Smart streaming search
  const streamingSearch = useSmartStreamingSearch(
    movies.map(m => m.id),
    {
      mode,
      selectedServices,
      country: 'us',
      enabled: movies.length > 0,
      autoFetch: mode === 'instant'
    }
  );

  // Filter movies by streaming availability
  const filteredMovies = useMemo(() => {
    if (selectedServices.length === 0) return movies;

    return movies.filter(movie => {
      const streamingData = streamingSearch.getStreamingData(movie.id);
      if (!streamingData) return mode === 'lazy';
      
      return selectedServices.some(serviceId =>
        streamingData.availableServices.some(available =>
          available.toLowerCase().includes(serviceId.toLowerCase()) ||
          serviceId.toLowerCase().includes(available.toLowerCase())
        )
      );
    });
  }, [movies, selectedServices, streamingSearch, mode]);

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

  return (
    <div className="space-y-6" id="smart-movie-section">
      {/* Section Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {streamingSearch.stats.total > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {filteredMovies.length} movies
              </span>
              {streamingSearch.stats.withStreaming > 0 && (
                <Badge variant="secondary" className="bg-green-600/20 text-green-600 border-green-600/30">
                  {streamingSearch.stats.withStreaming} streaming
                </Badge>
              )}
              {streamingSearch.loading && (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-muted-foreground">Checking...</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <MovieFilters onFilterChange={onFilterChange} />
                  </div>
                  
                  <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                    <StreamingServiceSelector
                      selectedServices={selectedServices}
                      onServicesChange={setSelectedServices}
                      country="us"
                      showLabel={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Movie Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
          >
            {filteredMovies.map((movie, index) => (
              <motion.div key={movie.id} variants={itemVariants}>
                <SmartMovieCard
                  movie={movie}
                  mode={mode}
                  selectedServices={selectedServices}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.has(movie.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state for filtered results */}
      {!isLoading && filteredMovies.length === 0 && movies.length > 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No movies match your current filters. Try adjusting your streaming service selection.
          </p>
        </Card>
      )}
    </div>
  );
};
