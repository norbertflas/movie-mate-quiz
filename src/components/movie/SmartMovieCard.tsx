
import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { StreamingBadge } from "./StreamingBadge";
import { useSmartStreamingSearch } from "@/hooks/use-smart-streaming-search";
import { type TMDBMovie } from "@/services/tmdb";

interface SmartMovieCardProps {
  movie: TMDBMovie;
  mode: 'instant' | 'lazy';
  selectedServices?: string[];
  onClick?: () => void;
  onFavorite?: (movieId: number) => void;
  isFavorite?: boolean;
}

export const SmartMovieCard = memo(({
  movie,
  mode,
  selectedServices = [],
  onClick,
  onFavorite,
  isFavorite = false
}: SmartMovieCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Use streaming search for this single movie
  const streamingSearch = useSmartStreamingSearch([movie.id], {
    mode,
    selectedServices,
    enabled: true,
    autoFetch: mode === 'instant'
  });

  const streamingData = streamingSearch.getStreamingData(movie.id);
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  const handleCardClick = () => {
    // For lazy mode, trigger streaming data fetch when clicked
    if (mode === 'lazy' && !streamingData) {
      streamingSearch.fetchBatch([movie.id]);
    }
    onClick?.();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(movie.id);
  };

  const rating = Math.round(movie.vote_average * 10);
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImageError(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>

        {/* Rating badge */}
        {rating > 0 && (
          <Badge className="absolute bottom-2 left-2 bg-black/70 text-white backdrop-blur-sm">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {rating}%
          </Badge>
        )}

        {/* Streaming badges (only in instant mode) */}
        {mode === 'instant' && streamingData?.streamingOptions && streamingData.streamingOptions.length > 0 && (
          <StreamingBadge 
            streamingOptions={streamingData.streamingOptions} 
            compact={true}
            maxShow={2}
          />
        )}

        {/* Loading indicator for lazy mode */}
        {mode === 'lazy' && streamingSearch.loading && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          {year && <span>{year}</span>}
          <span>{movie.vote_count?.toLocaleString()} votes</span>
        </div>

        {/* Streaming info for non-instant mode or when data is available */}
        {mode !== 'instant' && streamingData && (
          <div className="space-y-1">
            {streamingData.hasStreaming ? (
              <StreamingBadge 
                streamingOptions={streamingData.streamingOptions.slice(0, 3)} 
                compact={false}
                maxShow={3}
              />
            ) : (
              <Badge variant="outline" className="text-xs">
                Not available
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SmartMovieCard.displayName = "SmartMovieCard";
