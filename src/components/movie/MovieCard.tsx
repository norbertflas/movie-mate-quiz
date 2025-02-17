
import { useState } from "react";
import { CardHeader, CardContent } from "@/components/ui/card";
import { MovieCardContainer } from "@/components/movie/MovieCardContainer";
import { MovieCardHeader } from "@/components/movie/MovieCardHeader";
import { MovieCardMedia } from "@/components/movie/MovieCardMedia";
import { MovieExpandedContent } from "@/components/movie/MovieExpandedContent";
import { useMovieRating } from "@/components/movie/MovieRatingLogic";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MovieTrailerSection } from "@/components/movie/MovieTrailerSection";
import { MovieCardWrapper } from "@/components/movie/MovieCardWrapper";
import type { MovieInsights, MovieCardProps } from "@/types/movie";
import { UnifiedMovieDetails } from "@/components/movie/UnifiedMovieDetails";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import type { StreamingPlatformData } from "@/types/streaming";
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";
import { MovieRating } from "@/components/movie/MovieRating";

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
  const { data: availabilityData, isLoading, isError } = useStreamingAvailability(tmdbId, title, year);

  const availableServices = availabilityData?.services || streamingServices.map(service => {
    if (typeof service === 'string') {
      return {
        service,
        link: `https://${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
      };
    }
    return service;
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

  return (
    <>
      <MovieCardWrapper onClick={handleCardClick}>
        <MovieCardContainer isExpanded={false} onClick={handleCardClick}>
          <div className="relative">
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
            <div className="space-y-2">
              <MovieRating rating={rating} />
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>

              {explanations && explanations.length > 0 && (
                <div className="mt-2">
                  {explanations.map((explanation, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {explanation}
                    </Badge>
                  ))}
                </div>
              )}

              {availableServices.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">{t("streaming.availableOn")}</p>
                  <div className="flex flex-wrap gap-2">
                    {availableServices.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {typeof service === 'string' ? service : service.service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </MovieCardContainer>
      </MovieCardWrapper>

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
