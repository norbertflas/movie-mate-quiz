
import { motion } from "framer-motion";
import { Play, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useQuizStreamingSearch } from "@/hooks/use-quiz-streaming-search";
import { useEffect } from "react";

interface StreamingQuizResultsProps {
  movieIds: number[];
  userPreferences: {
    platforms?: string[];
    genres?: string[];
    mood?: string;
    contentType?: string;
  };
  onMovieSelect?: (tmdbId: number) => void;
}

export const StreamingQuizResults = ({ 
  movieIds, 
  userPreferences, 
  onMovieSelect 
}: StreamingQuizResultsProps) => {
  const { t } = useTranslation();
  const {
    isSearching,
    results,
    searchMoviesWithStreaming,
    getTopRecommendations,
    totalWithStreaming
  } = useQuizStreamingSearch();

  useEffect(() => {
    if (movieIds.length > 0) {
      searchMoviesWithStreaming(movieIds, userPreferences, {
        maxResults: 12,
        prioritizeSubscription: true
      });
    }
  }, [movieIds, userPreferences, searchMoviesWithStreaming]);

  const topResults = getTopRecommendations(8);

  if (isSearching) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("findPerfect.searching")}
          </p>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted h-64 rounded-lg mb-3" />
              <div className="bg-muted h-4 rounded w-3/4 mb-2" />
              <div className="bg-muted h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topResults.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          {t("discover.noMoviesFound")}
        </p>
        <p className="text-sm text-muted-foreground">
          Spróbuj zmienić swoje preferencje w quizie
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">
          {t("quiz.recommendations.title")}
        </h3>
        <p className="text-muted-foreground">
          {t("quiz.recommendations.subtitle")}
        </p>
        
        {totalWithStreaming > 0 && (
          <Badge variant="secondary" className="bg-green-500/20 text-green-700">
            {totalWithStreaming} filmów dostępnych w streamingu
          </Badge>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topResults.map((movie, index) => (
          <motion.div
            key={movie.tmdbId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
              <div className="relative">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-64 bg-muted flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Streaming Services Overlay */}
                {movie.streamingData.length > 0 && (
                  <div className="absolute top-2 right-2 space-y-1">
                    {movie.streamingData.slice(0, 3).map((service, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                        title={service.service}
                      >
                        <img
                          src={service.logo}
                          alt={service.service}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Preferred Platform Badge */}
                {movie.hasPreferredService && (
                  <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                    Twoje serwisy
                  </Badge>
                )}
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                    {movie.title}
                  </h4>
                  
                  {movie.year && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {movie.year}
                    </div>
                  )}
                </div>

                {/* Streaming Options */}
                <div className="space-y-2 mt-2">
                  {movie.streamingData.slice(0, 2).map((service, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Play className="h-2 w-2 text-white" />
                        </div>
                        {service.service}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {service.type === 'subscription' ? 'Subskrypcja' : 
                         service.type === 'rent' ? 'Wypożyczenie' : 
                         service.type === 'buy' ? 'Kup' : 'Dostępne'}
                      </Badge>
                    </div>
                  ))}
                  
                  {movie.streamingData.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{movie.streamingData.length - 2} więcej serwisów
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => onMovieSelect?.(movie.tmdbId)}
                >
                  {t("common.viewDetails")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Show More Button */}
      {results.length > 8 && (
        <div className="text-center">
          <Button variant="outline">
            Zobacz więcej rekomendacji ({results.length - 8})
          </Button>
        </div>
      )}
    </motion.div>
  );
};
