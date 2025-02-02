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
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

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
  const { toast } = useToast();
  
  const { userRating, handleRating } = useMovieRating(title);

  // Query streaming availability with improved error handling and retry logic
  const { data: availableServices = [], isLoading, isError, error } = useQuery({
    queryKey: ['streamingAvailability', tmdbId, title, year],
    queryFn: () => getStreamingAvailability(tmdbId, title, year),
    enabled: !!tmdbId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: (failureCount, error: any) => {
      // Only retry if it's a rate limit error and we haven't tried 3 times
      return error?.status === 429 && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: {
      onError: (error: any) => {
        if (error?.status === 429) {
          const retryAfter = error?.body?.retryAfter || 60;
          toast({
            title: t("errors.rateLimitExceeded"),
            description: t("errors.tryAgainIn", { seconds: retryAfter }),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("errors.generic"),
            description: t("errors.tryAgain"),
            variant: "destructive",
          });
        }
      }
    }
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

  // Create a TMDBMovie object from the props
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

  const renderStreamingServices = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 p-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      );
    }

    if (isError) {
      const isRateLimit = (error as any)?.status === 429;
      return (
        <Alert variant="destructive" className="bg-destructive/10 border-none">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isRateLimit 
              ? t("streaming.rateLimitError")
              : t("streaming.errorChecking")}
          </AlertDescription>
        </Alert>
      );
    }

    if (availableServices.length === 0) {
      return (
        <Alert variant="default" className="bg-muted/50 border-none">
          <AlertDescription>
            {t("streaming.notAvailable")}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {t("streaming.availableOn")}:
        </span>
        {availableServices.map((service) => (
          <HoverCard key={service.service}>
            <HoverCardTrigger asChild>
              <a 
                href={service.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 hover:bg-accent cursor-pointer"
                >
                  <img 
                    src={service.logo || `/streaming-icons/${service.service.toLowerCase()}.svg`}
                    alt={service.service}
                    className="w-4 h-4"
                  />
                  {service.service}
                </Badge>
              </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    {t("streaming.watchOn", { service: service.service })}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("streaming.clickToWatch")}
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    );
  };

  return (
    <>
      <MovieCardWrapper onClick={handleCardClick}>
        <MovieCardContainer isExpanded={false} onClick={handleCardClick}>
          <div className="relative">
            {isDetailsOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-50 bg-background/80 hover:bg-background/90 rounded-full"
                onClick={handleCloseDetails}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <MovieTrailerSection
              showTrailer={showTrailer}
              title={title}
              year={year}
              trailerUrl={trailerUrl}
              setTrailerUrl={setTrailerUrl}
            />

            <MovieCardMedia
              showTrailer={showTrailer}
              trailerUrl={trailerUrl}
              imageUrl={imageUrl}
              title={title}
            />
          </div>

          <CardHeader className="space-y-1 p-4">
            <MovieCardHeader
              title={title}
              isFavorite={isFavorite}
              onToggleFavorite={() => setIsFavorite(!isFavorite)}
            />
          </CardHeader>

          <CardContent className="space-y-4 flex-grow p-4">
            {renderStreamingServices()}
          </CardContent>
        </MovieCardContainer>
      </MovieCardWrapper>

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