import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { MovieStreamingServices } from "./MovieStreamingServices";
import { MovieCardHeader } from "./MovieCardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { MovieFavoriteHandler } from "./MovieFavoriteHandler";
import { MovieRatingHandler } from "./MovieRatingHandler";
import { MovieMediaSection } from "./MovieMediaSection";
import { MovieExpandedContent } from "./MovieExpandedContent";

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

  const handleTrailerToggle = () => {
    setShowTrailer(!showTrailer);
  };

  const handleRatingWrapper = (rating: "like" | "dislike") => (e: React.MouseEvent) => {
    handleRating(rating);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className="group relative overflow-hidden h-full flex flex-col bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5 dark:from-background/80 dark:via-background/50 dark:to-purple-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20 hover:shadow-xl transition-all duration-300 cursor-pointer" 
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
            onRate={handleRatingWrapper}
            tmdbId={tmdbId}
          />
        </CardContent>

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
};