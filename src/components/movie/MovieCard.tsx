
import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { MovieStreamingServices } from "./MovieStreamingServices";
import { MovieCardHeader } from "./MovieCardHeader";
import { motion } from "framer-motion";
import { MovieFavoriteHandler } from "./MovieFavoriteHandler";
import { MovieMediaSection } from "./MovieMediaSection";
import { MovieExpandedContent } from "./MovieExpandedContent";
import { useMovieRating } from "./MovieRatingLogic";
import { useToast } from "../ui/use-toast";
import { X } from "lucide-react";
import { Button } from "../ui/button";

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
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const { toast } = useToast();
  
  const { userRating, handleRating } = useMovieRating(title);

  const { handleToggleFavorite } = MovieFavoriteHandler({ 
    isFavorite, 
    setIsFavorite, 
    title 
  });

  const handleTrailerToggle = () => {
    setShowTrailer(!showTrailer);
  };

  const handleStreamingError = () => {
    toast({
      title: "Streaming Services Unavailable",
      description: "We're having trouble loading streaming services. Please try again later.",
      variant: "destructive",
    });
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
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
        {isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50 bg-background/80 hover:bg-background/90 rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

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
          <MovieStreamingServices 
            services={streamingServices} 
            isLoading={isLoadingServices}
            onError={handleStreamingError}
          />
          
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
          />
        </CardContent>

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
};
