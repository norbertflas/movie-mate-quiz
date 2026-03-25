import { useState, memo, useCallback, useEffect } from "react";
import { Badge } from "../ui/badge";
import type { MovieCardProps } from "@/types/movie";
import type { StreamingPlatformData } from "@/types/streaming";
import { UnifiedMovieDetails } from "./UnifiedMovieDetails";
import { useTranslation } from "react-i18next";
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";
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
  const { t } = useTranslation();
  
  // Use unified streaming hook
  const { 
    services: streamingDataServices, 
    isLoading: streamingLoading,
    fetchData,
    requested
  } = useStreamingAvailability(tmdbId && tmdbId > 0 ? tmdbId : 0, title, year);

  // Auto-fetch in instant mode
  useEffect(() => {
    if (!tmdbId || tmdbId <= 0 || requested) return;
    if (mode === 'instant' && showStreamingBadges) {
      fetchData();
    }
  }, [tmdbId, mode, showStreamingBadges, requested]);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      // In LAZY mode, fetch streaming data when opening details
      if (mode === 'lazy' && tmdbId && tmdbId > 0 && !requested) {
        fetchData();
      }
      setIsDetailsOpen(true);
    }
  }, [onClick, mode, tmdbId, requested, fetchData]);

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

  // Use streaming data from unified hook or fallback to transformed props
  const availableServices = streamingDataServices.length > 0
    ? streamingDataServices
    : transformedServices;

  const hasStreamingData = streamingDataServices.length > 0;
  const isLoadingStreaming = streamingLoading && mode === 'instant' && showStreamingBadges;

  return (
    <>
      <div 
        className="movie-card flex flex-col h-full cursor-pointer hover-lift relative"
        onClick={handleCardClick}
      >
        <div className="relative h-[240px] overflow-hidden rounded-t-xl">
          <OptimizedMovieImage 
            imageUrl={imageUrl} 
            title={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                  streamingOptions={streamingDataServices.map(s => ({
                    service: s.service,
                    serviceLogo: s.logo || '',
                    type: s.type || 'subscription',
                    link: s.link || '#',
                    quality: 'HD'
                  }))}
                  mode="compact"
                  maxServices={2}
                />
              ) : null}
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <MovieRating rating={rating} />
          </div>
        </div>

        <div className="flex-1 p-4 bg-card rounded-b-xl border-x border-b border-border/50">
          <div className="mb-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{year}</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {explanations.slice(0, 2).map((exp, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-2 h-5">
                {exp}
              </Badge>
            ))}
          </div>
        </div>
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

ProMovieCard.displayName = "ProMovieCard";

export default ProMovieCard;
