
import { useState, memo, useCallback } from "react";
import { CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import type { MovieCardProps } from "@/types/movie";
import { UnifiedMovieDetails } from "./UnifiedMovieDetails";
import { useTranslation } from "react-i18next";
import { useOptimizedStreaming } from "@/hooks/use-optimized-streaming";
import { MovieRating } from "./MovieRating";
import { Heart } from "lucide-react";
import { OptimizedMovieImage } from "./OptimizedMovieImage";

export const MovieCard = memo(({
  title,
  year,
  platform,
  genre,
  imageUrl,
  description,
  trailerUrl: initialTrailerUrl,
  rating,
  tags = [],
  streamingServices = [],
  tmdbId,
  explanations = [],
  onClose,
  onClick,
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { t } = useTranslation();
  
  // Use optimized streaming hook
  const streamingData = useOptimizedStreaming(tmdbId && tmdbId > 0 ? tmdbId : 0, title, year);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      // Lazy load streaming data only when details are opened
      if (!streamingData.services.length && tmdbId > 0) {
        streamingData.fetchData();
      }
      setIsDetailsOpen(true);
    }
  }, [onClick, streamingData, tmdbId]);

  const handleCloseDetails = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsDetailsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  // Use streaming data from optimized hook if available, otherwise fallback to props
  const availableServices = streamingData.services?.length > 0
    ? streamingData.services
    : streamingServices;

  return (
    <>
      <div 
        className="movie-card flex flex-col h-full cursor-pointer hover-lift"
        onClick={handleCardClick}
      >
        <div className="relative h-[240px] overflow-hidden rounded-t-xl">
          <OptimizedMovieImage
            imageUrl={imageUrl}
            title={title}
            className="w-full h-full"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 z-10">
            <button
              className={`rounded-full p-2 ${isFavorite ? 'bg-primary/20 backdrop-blur-sm' : 'bg-black/30 backdrop-blur-sm'} transition-colors`}
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} 
              />
            </button>
          </div>
        </div>
        
        <CardContent className="flex flex-col flex-grow p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg" title={title}>
                <span className="line-clamp-1">{title}</span>
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{year}</span>
                {genre && (
                  <>
                    <span>•</span>
                    <span>{genre}</span>
                  </>
                )}
              </div>
            </div>
            
            <MovieRating rating={rating} />
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3" title={description}>
              {description}
            </p>
          )}

          {/* Show streaming availability indicator */}
          {availableServices.length > 0 && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {availableServices.length} service{availableServices.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </CardContent>
      </div>

      {isDetailsOpen && (
        <UnifiedMovieDetails
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          movie={{
            id: tmdbId || 0,
            title,
            release_date: year,
            overview: description,
            poster_path: imageUrl?.replace('https://image.tmdb.org/t/p/w500', '') || '',
            vote_average: rating / 10,
            vote_count: 0,
            popularity: 0,
            backdrop_path: null,
            genre_ids: [],
            explanations
          }}
          explanations={explanations}
          streamingServices={availableServices}
        />
      )}
    </>
  );
});

MovieCard.displayName = "MovieCard";
