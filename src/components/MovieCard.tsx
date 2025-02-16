
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
import type { StreamingService } from "@/types/streaming";
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";

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

  // Extract services from the availability data or use initial services
  const availableServices: StreamingService[] = availabilityData?.services || 
    streamingServices.map(service => {
      if (typeof service === 'string') {
        return {
          service: service,
          link: `https://${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
        };
      }
      return service as StreamingService;
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
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
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
