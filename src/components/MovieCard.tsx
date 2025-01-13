import { useState } from "react";
import { CardHeader } from "./ui/card";
import { MovieCardContainer } from "./movie/MovieCardContainer";
import { MovieCardContent } from "./movie/MovieCardContent";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieRatingHandler } from "./movie/MovieRatingHandler";
import { MovieMediaSection } from "./movie/MovieMediaSection";

interface MovieCardProps {
  title: string;
  year: string;
  platform: string;
  genre: string;
  imageUrl: string;
  description: string;
  trailerUrl: string;
  rating: number;
  tags?: string[];
  streamingServices?: string[];
  tmdbId?: number;
}

export const MovieCard = ({
  title,
  year,
  platform,
  genre,
  imageUrl,
  description,
  trailerUrl,
  rating,
  tags,
  streamingServices = [],
  tmdbId,
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);

  const { handleToggleFavorite } = MovieFavoriteHandler({ 
    isFavorite, 
    setIsFavorite, 
    title 
  });

  const { handleRating } = MovieRatingHandler({ 
    setUserRating, 
    title 
  });

  return (
    <MovieCardContainer
      isExpanded={isExpanded}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <MovieMediaSection
        showTrailer={showTrailer}
        trailerUrl={trailerUrl}
        imageUrl={imageUrl}
        title={title}
      />

      <CardHeader className="space-y-1 p-4">
        <MovieCardHeader
          title={title}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      </CardHeader>

      <MovieCardContent
        streamingServices={streamingServices}
        isExpanded={isExpanded}
        title={title}
        year={year}
        description={description}
        rating={rating}
        genre={genre}
        tags={tags}
        showTrailer={showTrailer}
        onWatchTrailer={() => setShowTrailer(!showTrailer)}
        userRating={userRating}
        onRate={handleRating}
        tmdbId={tmdbId}
      />
    </MovieCardContainer>
  );
};