import { useState, memo, useCallback, useEffect } from "react";
import { Badge } from "../ui/badge";
import type { MovieCardProps } from "@/types/movie";
import type { StreamingPlatformData } from "@/types/streaming";
import { UnifiedMovieDetails } from "./UnifiedMovieDetails";
import { useStreamingPro, MovieStreamingData } from "@/hooks/use-streaming-pro";
import { Star } from "lucide-react";

interface ProMovieCardProps extends Partial<MovieCardProps> {
  mode?: 'instant' | 'lazy';
  showStreamingBadges?: boolean;
  title: string;
  tmdbId: number;
}

export const ProMovieCard = memo(({
  title,
  year = '',
  imageUrl = '',
  description = '',
  rating = 0,
  streamingServices = [],
  tmdbId,
  explanations = [],
  onClose,
  onClick,
  mode = 'lazy',
  showStreamingBadges = false,
}: ProMovieCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [streamingData, setStreamingData] = useState<MovieStreamingData | null>(null);
  
  const { 
    fetchSingleMovie, 
    getStreamingData, 
    getUserCountry,
    loading: streamingLoading 
  } = useStreamingPro();

  useEffect(() => {
    if (!tmdbId || tmdbId <= 0) return;
    const cachedData = getStreamingData(tmdbId);
    if (cachedData) {
      setStreamingData(cachedData);
      return;
    }
    if (mode === 'instant' && showStreamingBadges) {
      const timeoutId = setTimeout(() => {
        fetchSingleMovie(tmdbId, { 
          country: getUserCountry(),
          mode: 'instant',
          cacheEnabled: true 
        }).then(data => {
          if (data) setStreamingData(data);
        }).catch(() => {});
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [tmdbId, mode, showStreamingBadges]);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      if (mode === 'lazy' && tmdbId && tmdbId > 0 && !streamingData) {
        fetchSingleMovie(tmdbId, {
          country: getUserCountry(),
          mode: 'lazy',
          cacheEnabled: true
        }).then(data => {
          if (data) setStreamingData(data);
        });
      }
      setIsDetailsOpen(true);
    }
  }, [onClick, mode, tmdbId, streamingData, fetchSingleMovie, getUserCountry]);

  const handleCloseDetails = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDetailsOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  const transformedServices: StreamingPlatformData[] = streamingServices.map(service => {
    if (typeof service === 'string') {
      return { service, available: true, tmdbId, type: 'subscription' as const };
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

  const displayRating = rating > 10 ? (rating / 10).toFixed(1) : rating.toFixed(1);
  const hasStreaming = streamingData?.streamingOptions?.length > 0;

  // Get up to 3 streaming service icons
  const streamingIcons = streamingData?.streamingOptions?.slice(0, 3).map(opt => ({
    name: opt.service,
    logo: opt.serviceLogo
  })) || [];

  return (
    <>
      <div 
        className="group cursor-pointer relative rounded-xl overflow-hidden bg-card border border-border/30 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
        onClick={handleCardClick}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Rating badge */}
          {rating > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white">{displayRating}</span>
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-1" title={title}>
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{year}</span>
            
            {/* Streaming icons */}
            {streamingIcons.length > 0 && (
              <div className="flex items-center gap-1">
                {streamingIcons.map((s, i) => (
                  <img
                    key={i}
                    src={s.logo || `/streaming-icons/default.svg`}
                    alt={s.name}
                    className="w-4 h-4 rounded-sm object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ))}
              </div>
            )}
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
          streamingServices={transformedServices}
        />
      )}
    </>
  );
});

ProMovieCard.displayName = "ProMovieCard";

export default ProMovieCard;
