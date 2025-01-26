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
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [trailerUrl, setTrailerUrl] = useState(initialTrailerUrl);
  const [insights, setInsights] = useState<MovieInsights | null>(null);
  
  const { userRating, handleRating } = useMovieRating(title);

  const handleCardClick = () => {
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
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
    adult: false,
    genre_ids: [],
    original_language: '',
    original_title: '',
    video: false
  };

  return (
    <>
      <MovieCardWrapper onClick={handleCardClick}>
        <MovieCardContainer isExpanded={false} onClick={handleCardClick}>
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

          <CardHeader className="space-y-1 p-4">
            <MovieCardHeader
              title={title}
              isFavorite={isFavorite}
              onToggleFavorite={() => setIsFavorite(!isFavorite)}
            />
          </CardHeader>

          <CardContent className="space-y-4 flex-grow p-4">
            {availableServices.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Available on:
                </span>
                {availableServices.map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </MovieCardContainer>
      </MovieCardWrapper>

      <UnifiedMovieDetails
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        movie={movieData}
        explanations={explanations}
      />
    </>
  );
};