import { useState } from "react";
import { CardContent } from "../ui/card";
import { MovieCardContainer } from "./MovieCardContainer";
import { MovieCardHeader } from "./MovieCardHeader";
import { MovieTrailerSection } from "./MovieTrailerSection";
import { useMovieRating } from "./MovieRatingLogic";
import { Badge } from "../ui/badge";
import type { MovieCardProps } from "@/types/movie";
import { UnifiedMovieDetails } from "./UnifiedMovieDetails";
import { useTranslation } from "react-i18next";
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";
import { MovieRating } from "./MovieRating";
import { Heart } from "lucide-react";
import { formatServiceLinks, getServiceIconPath, normalizeServiceName } from "@/utils/streamingServices";

export const MovieCard = ({
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
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(initialTrailerUrl);
  const { t } = useTranslation();
  
  const { userRating, handleRating } = useMovieRating(title);
  
  // Only attempt to fetch streaming data if we have a valid tmdbId
  const availabilityData = useStreamingAvailability(tmdbId && tmdbId > 0 ? tmdbId : 0);

  // Process streaming services to ensure they have the correct format
  const processedServices = streamingServices.map(service => {
    if (typeof service === 'string') {
      return {
        service,
        available: true,
        tmdbId,
        link: undefined, // Will be populated by formatServiceLinks
        logo: undefined  // Will be populated by formatServiceLinks
      };
    }
    return {
      ...service,
      available: true,
      tmdbId,
    };
  });

  // Format all service data to ensure consistent links and logos
  const formattedPropServices = formatServiceLinks(processedServices);

  // Use API data if available, otherwise fall back to prop data
  const availableServices = availabilityData.services?.length > 0
    ? availabilityData.services
    : formattedPropServices;
    
  // For display in the UI, calculate a timestamp for when streaming was last checked
  const lastChecked = availabilityData.timestamp 
    ? new Date(availabilityData.timestamp).toLocaleString() 
    : new Date().toLocaleString();

  // Safe translation function
  const safeTranslate = (key: string, defaultValue: string): string => {
    const translated = t(key);
    return translated !== key ? translated : defaultValue;
  };

  const handleCardClick = () => {
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsDetailsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <div 
        className="movie-card flex flex-col h-full cursor-pointer hover-lift"
        onClick={handleCardClick}
      >
        <div className="relative h-[240px] overflow-hidden rounded-t-xl">
          <img 
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
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
          
          <div className="mt-auto pt-2">
            {availabilityData.isLoading ? (
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {safeTranslate("streaming.loading", "Loading streaming info...")}
              </p>
            ) : availableServices && availableServices.length > 0 ? (
              <>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {safeTranslate("streaming.availableOn", "Available on")}
                  <span className="text-xs ml-1 opacity-75">
                    • {safeTranslate("streaming.lastChecked", "Last checked")}: {lastChecked.split(',')[0]}
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {availableServices.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
                      <img 
                        src={service.logo || getServiceIconPath(service.service)}
                        alt={service.service}
                        className="w-3 h-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/streaming-icons/default.svg";
                        }}
                      />
                      {normalizeServiceName(service.service)}
                    </Badge>
                  ))}
                  {availableServices.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{availableServices.length - 3}
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {safeTranslate("streaming.notAvailable", "Not available for streaming")}
                <span className="text-xs ml-1 opacity-75">
                  • {safeTranslate("streaming.lastChecked", "Last checked")}: {lastChecked.split(',')[0]}
                </span>
              </p>
            )}
          </div>
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
};
