import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MovieStreamingServices } from "./movie/MovieStreamingServices";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieRatingHandler } from "./movie/MovieRatingHandler";
import { MovieMediaSection } from "./movie/MovieMediaSection";
import { MovieMetadata } from "./movie/MovieMetadata";
import { MovieDescription } from "./movie/MovieDescription";
import { MovieTags } from "./movie/MovieTags";
import { MovieActions } from "./movie/MovieActions";

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

  const handleTrailerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTrailer(!showTrailer);
  };

  const handleRateClick = (rating: "like" | "dislike", e: React.MouseEvent) => {
    e.stopPropagation();
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
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <MovieMetadata
                  year={year}
                  genre={genre}
                  rating={rating}
                />
                
                <MovieDescription description={description} />
                
                <MovieTags tags={tags || []} />

                <MovieActions
                  userRating={userRating}
                  showTrailer={showTrailer}
                  onToggleTrailer={handleTrailerToggle}
                  onRate={handleRateClick}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
};