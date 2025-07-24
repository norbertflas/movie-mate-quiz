import { useState, memo, useCallback, useEffect } from "react";
import { CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import type { MovieCardProps } from "@/types/movie";
import type { StreamingPlatformData } from "@/types/streaming";
import { UnifiedMovieDetails } from "./UnifiedMovieDetails";
import { useTranslation } from "react-i18next";
import { useStreamingPro, MovieStreamingData } from "@/hooks/use-streaming-pro";
import { MovieRating } from "./MovieRating";
import { Heart } from "lucide-react";
import { OptimizedMovieImage } from "./OptimizedMovieImage";
import StreamingBadge from "../streaming/StreamingBadge";

interface ProMovieCardProps extends Partial<MovieCardProps> {
  mode?: 'instant' | 'lazy';
  showStreamingBadges?: boolean;
  // Override required props
  title: string;
  tmdbId: number;
}

export const ProMovieCard = memo(({
  title,
  year = '',
  platform = '',
  genre = '',
  imageUrl = '',
  description = '',
  trailerUrl: initialTrailerUrl = '',
  rating = 0,
  tags = [],
  streamingServices = [],
  tmdbId,
  explanations = [],
  onClose,
  onClick,
  mode = 'lazy',
  showStreamingBadges = false
}: ProMovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [streamingData, setStreamingData] = useState<MovieStreamingData | null>(null);
  const { t } = useTranslation();
  
  const { 
    fetchSingleMovie, 
    getStreamingData, 
    getUserCountry,
    loading: streamingLoading 
  } = useStreamingPro();

  // Load streaming data based on mode
  useEffect(() => {
    if (!tmdbId || tmdbId <= 0) return;

    // Check if we already have cached data
    const cachedData = getStreamingData(tmdbId);
    if (cachedData) {
      setStreamingData(cachedData);
      return;
    }

    // In INSTANT mode, fetch streaming data immediately
    if (mode === 'instant' && showStreamingBadges) {
      fetchSingleMovie(tmdbId, { 
        country: getUserCountry(),
        mode: 'instant',
        cacheEnabled: true 
      }).then(data => {
        if (data) {
          setStreamingData(data);
        }
      });
    }
  }, [tmdbId, mode, showStreamingBadges, fetchSingleMovie, getStreamingData, getUserCountry]);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      // In LAZY mode, fetch streaming data when opening details
      if (mode === 'lazy' && tmdbId && tmdbId > 0 && !streamingData) {
        fetchSingleMovie(tmdbId, {
          country: getUserCountry(),
          mode: 'lazy',
          cacheEnabled: true
        }).then(data => {
          if (data) {
            setStreamingData(data);
          }
        });
      }
      setIsDetailsOpen(true);
    }
  }, [onClick, mode, tmdbId, streamingData, fetchSingleMovie, getUserCountry]);

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

  // Transform legacy streaming services to new format if needed
  const transformedServices: StreamingPlatformData[] = streamingServices.map(service => {
    if (typeof service === 'string') {
      return {
        service,
        available: true,
        tmdbId,
        type: 'subscription' as const
      };
    }
    return {
      service: service.service,
      available: true,
      link: service.link,
      logo: service.logo,
      tmdbId,
      type: 'subscription' as const
    };
  });

  // Use legacy transformed services - keep it simple to avoid type conflicts
  const availableServices = transformedServices;

  const hasStreamingData = streamingData?.streamingOptions?.length > 0;
  const isLoadingStreaming = streamingLoading && mode === 'instant' && showStreamingBadges;

  return (
    <>
      <div 
        className="movie-card flex flex-col h-full cursor-pointer hover-lift relative"
        onClick={handleCardClick}
      >
        <div className="relative h-[240px] overflow-hidden rounded-t-xl">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Favorite button */}
          <div className="absolute top-3 left-3 z-20">
            <button
              className={`rounded-full p-2 ${isFavorite ? 'bg-primary/20 backdrop-blur-sm' : 'bg-black/30 backdrop-blur-sm'} transition-colors`}
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} 
              />
            </button>
          </div>

          {/* Streaming badges - only in INSTANT mode */}
          {mode === 'instant' && showStreamingBadges && (
            <div className="absolute top-3 right-3 z-10">
              {isLoadingStreaming ? (
                <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/20">
                  Sprawdzanie...
                </Badge>
              ) : hasStreamingData ? (
                <StreamingBadge 
                  streamingOptions={streamingData!.streamingOptions}
                  mode="compact"
                  maxServices={2}
                />
              ) : null}
            </div>
          )}
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

          {/* Streaming availability indicator for LAZY mode */}
          {mode === 'lazy' && availableServices.length > 0 && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {availableServices.length} serwis{availableServices.length > 1 ? 'ów' : ''}
              </Badge>
            </div>
          )}

          {/* Loading indicator for streaming data */}
          {isLoadingStreaming && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-muted-foreground">Sprawdzanie dostępności...</span>
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
          // Pass raw streaming data for detailed view
          // streamingData={streamingData}
        />
      )}
    </>
  );
});

ProMovieCard.displayName = "ProMovieCard";

export default ProMovieCard;