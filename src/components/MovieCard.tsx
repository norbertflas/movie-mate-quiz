import { useState } from "react";
import { CardHeader, CardContent } from "./ui/card";
import { MovieCardContainer } from "./movie/MovieCardContainer";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieCardMedia } from "./movie/MovieCardMedia";
import { MovieExpandedContent } from "./movie/MovieExpandedContent";
import { useMovieRating } from "./movie/MovieRatingLogic";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { MovieTrailerSection } from "./movie/MovieTrailerSection";
import { MovieCardWrapper } from "./movie/MovieCardWrapper";
import type { MovieInsights, MovieCardProps } from "@/types/movie";
import { UnifiedMovieDetails } from "./movie/UnifiedMovieDetails";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import type { StreamingPlatformData } from "@/types/streaming";
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";
import { MovieRating } from "./movie/MovieRating";

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
  const [insights, setInsights] = useState<MovieInsights | null>(null);
  const { t } = useTranslation();
  
  const { userRating, handleRating } = useMovieRating(title);
  const { data: availabilityData, isLoading, isError } = useStreamingAvailability(tmdbId || 0);

  const availableServices = availabilityData?.services.map(service => ({
    service: service.service,
    link: service.link || `https://${service.service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
    logo: service.logo
  })) || streamingServices.map(service => {
    if (typeof service === 'string') {
      return {
        service: service,
        link: `https://${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
        logo: undefined
      };
    }
    return {
      service: typeof service === 'object' && service !== null ? service.service : String(service),
      link: typeof service === 'object' && service !== null && service.link ? 
        service.link : 
        `https://${(typeof service === 'object' && service !== null ? service.service : String(service)).toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
      logo: typeof service === 'object' && service !== null ? service.logo : undefined
    };
  });

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

  const movieData: TMDBMovie = {
    id: tmdbId || 0,
    title,
    release_date: year,
    overview: description,
    poster_path: imageUrl.replace('https://image.tmdb.org/t/p/w500', ''),
    vote_average: rating / 10,
    vote_count: 0,
    popularity: 0,
    backdrop_path: null,
    genre_ids: [],
    explanations: explanations
  };

  return (
    <>
      <div 
        className="movie-card group cursor-pointer h-full flex flex-col"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="movie-gradient"></div>
          
          <div className="absolute top-2 right-2 z-10">
            <button 
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-primary/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill={isFavorite ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-bold text-lg line-clamp-1 mb-1">{title}</h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{year}</span>
            {genre && (
              <>
                <span>•</span>
                <span>{genre}</span>
              </>
            )}
          </div>
          
          <MovieRating rating={rating} />
          
          <p className="text-sm text-muted-foreground line-clamp-2 mt-3 mb-3">
            {description}
          </p>
          
          <div className="mt-auto pt-2">
            {!isLoading && availableServices.length > 0 ? (
              <>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t("streaming.availableOn") || "Available on"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableServices.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                      {service.service}
                    </Badge>
                  ))}
                  {availableServices.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{availableServices.length - 3}
                    </Badge>
                  )}
                </div>
              </>
            ) : !isLoading ? (
              <div className="streaming-notavailible">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t("streaming.notavailible") || "Not available for streaming"}
                </p>
              </div>
            ) : (
              <div className="streaming-loading">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t("streaming.loading") || "Loading streaming info..."}
                </p>
              </div>
            )}
          </div>
          
          {explanations && explanations.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex flex-wrap gap-1.5">
                {explanations.slice(0, 2).map((explanation, index) => (
                  <Badge key={index} variant="secondary" className="text-xs whitespace-nowrap">
                    {explanation}
                  </Badge>
                ))}
                {explanations.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{explanations.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isDetailsOpen && (
        <UnifiedMovieDetails
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          movie={movieData}
          explanations={explanations}
          streamingServices={availableServices}
        />
      )}
    </>
  );
};
