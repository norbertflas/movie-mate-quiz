
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
  tmdbId,
  title,
  year,
  platform,
  genre,
  imageUrl,
  description,
  trailerUrl: initialTrailerUrl = "",
  rating,
  onClick,
  insights,
  explanations,
  onDetailsClick
}: MovieCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(initialTrailerUrl);
  const { t } = useTranslation();
  const { userRating, handleRate } = useMovieRating(tmdbId);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    if (onClick) onClick();
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDetailsClick) onDetailsClick();
  };

  const handleWatchTrailer = () => {
    setShowTrailer(!showTrailer);
  };

  // Fetch streaming availability with improved error handling
  const { data: streamingData, isLoading, isError } = useStreamingAvailability(tmdbId);
  
  // Get available streaming services with fallback
  const availableServices = streamingData?.services || [];

  // Safe translation function that defaults to English if translation is missing
  const safeTranslate = (key: string, defaultValue: string): string => {
    const translated = t(key);
    // Check if the translation was successful (not returning the key itself)
    return translated !== key ? translated : defaultValue;
  };

  return (
    <MovieCardContainer onClick={handleCardClick}>
      <CardHeader className="relative p-0">
        <MovieCardHeader
          imageUrl={imageUrl}
          title={title}
          onDetailsClick={onDetailsClick ? handleDetailsClick : undefined}
        />
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
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
            <button
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Add to favorites functionality would go here
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col flex-grow p-0">
            <MovieRating rating={rating} />
            
            <p className="text-sm text-muted-foreground line-clamp-2 mt-3 mb-3">
              {description}
            </p>
            
            <div className="mt-auto pt-2">
              {!isLoading && availableServices.length > 0 ? (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {safeTranslate("streaming.availableOn", "Available on")}
                  </p>
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
                <div className="streaming-not-available">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {safeTranslate("streaming.notavailable", "Not available for streaming")}
                  </p>
                </div>
              ) : (
                <div className="streaming-loading">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {safeTranslate("streaming.loading", "Loading streaming info...")}
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
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      +{explanations.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <MovieTrailerSection
          showTrailer={showTrailer}
          title={title}
          year={year}
          trailerUrl={trailerUrl}
          setTrailerUrl={setTrailerUrl}
        />
      </CardContent>
    </MovieCardContainer>
  );
};
