import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MovieStreamingServices } from "./MovieStreamingServices";
import { MovieCardHeader } from "./MovieCardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieRatingHandler } from "./movie/MovieRatingHandler";
import { MovieMediaSection } from "./movie/MovieMediaSection";
import { MovieExpandedContent } from "./movie/MovieExpandedContent";

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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card 
        className="group relative overflow-hidden h-full flex flex-col glass-card
                   hover:shadow-xl dark:hover:shadow-primary/10 transition-all duration-300" 
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
          
          <AnimatePresence mode="wait">
            <MovieExpandedContent
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
          </AnimatePresence>
        </CardContent>

        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
};