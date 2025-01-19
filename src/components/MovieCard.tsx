import { useState, useEffect } from "react";
import { CardHeader, CardContent } from "./ui/card";
import { MovieCardContainer } from "./movie/MovieCardContainer";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieCardMedia } from "./movie/MovieCardMedia";
import { MovieExpandedContent } from "./movie/MovieExpandedContent";
import { useMovieRating } from "./movie/MovieRatingLogic";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";
import { MovieTrailerSection } from "./movie/MovieTrailerSection";
import { MovieCardWrapper } from "./movie/MovieCardWrapper";
import type { MovieInsights, MovieCardProps } from "@/types/movie";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [trailerUrl, setTrailerUrl] = useState(initialTrailerUrl);
  const [insights, setInsights] = useState<MovieInsights | null>(null);
  
  const { userRating, handleRating } = useMovieRating(title);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && onClose) {
      onClose();
    }
  };

  const handleTrailerToggle = () => {
    setShowTrailer(!showTrailer);
  };

  const handleCardClick = () => {
    handleExpand();
  };

  return (
    <MovieCardWrapper onClick={handleCardClick}>
      <MovieCardContainer isExpanded={isExpanded} onClick={handleCardClick}>
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
          
          <AnimatePresence mode="wait">
            {isExpanded && (
              <MovieExpandedContent
                isExpanded={isExpanded}
                title={title}
                year={year}
                description={description}
                rating={rating > 1 ? rating : rating * 100}
                genre={genre}
                tags={tags}
                showTrailer={showTrailer}
                onWatchTrailer={handleTrailerToggle}
                userRating={userRating}
                onRate={handleRating}
                tmdbId={tmdbId}
                explanations={explanations}
                streamingServices={availableServices}
                insights={insights}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </MovieCardContainer>
    </MovieCardWrapper>
  );
};