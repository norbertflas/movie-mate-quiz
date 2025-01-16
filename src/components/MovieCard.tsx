import { useState } from "react";
import { CardHeader, CardContent } from "./ui/card";
import { MovieCardContainer } from "./movie/MovieCardContainer";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieCardMedia } from "./movie/MovieCardMedia";
import { MovieStreamingServices } from "./movie/MovieStreamingServices";
import { MovieExpandedContent } from "./movie/MovieExpandedContent";
import { useMovieRating } from "./movie/MovieRatingLogic";
import { motion } from "framer-motion";

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
  explanations?: string[];
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
  explanations = [],
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { userRating, handleRating } = useMovieRating(title);
  const { handleToggleFavorite } = MovieFavoriteHandler({ 
    isFavorite, 
    setIsFavorite, 
    title 
  });

  const handleTrailerToggle = () => {
    setShowTrailer(!showTrailer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <MovieCardContainer
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
            onToggleFavorite={handleToggleFavorite}
          />
        </CardHeader>

        <CardContent className="space-y-4 flex-grow p-4">
          <MovieStreamingServices services={streamingServices} />
          
          <MovieExpandedContent
            isExpanded={isExpanded}
            title={title}
            year={year}
            description={description}
            rating={rating}
            genre={genre}
            tags={tags}
            showTrailer={showTrailer}
            onWatchTrailer={handleTrailerToggle}
            userRating={userRating}
            onRate={handleRating}
            tmdbId={tmdbId}
            explanations={explanations}
          />
        </CardContent>
      </MovieCardContainer>
    </motion.div>
  );
};