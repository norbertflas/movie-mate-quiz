import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { MovieTrailer } from "./movie/MovieTrailer";
import { MovieActions } from "./movie/MovieActions";
import { MovieStreamingServices } from "./movie/MovieStreamingServices";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieDetailsExpanded } from "./movie/MovieDetailsExpanded";
import { motion, AnimatePresence } from "framer-motion";

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
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const { toast } = useToast();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? "Added to favorites" : "Removed from favorites",
      description: `"${title}" has been ${!isFavorite ? "added to" : "removed from"} your favorites.`,
    });
  };

  const handleRating = (rating: "like" | "dislike") => {
    setUserRating(rating);
    toast({
      title: "Rating saved",
      description: `Thank you for rating "${title}"!`,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <Card 
        className="overflow-hidden group cursor-pointer h-full flex flex-col hover:shadow-lg transition-all duration-300" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div 
          className="aspect-video relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {showTrailer && trailerUrl ? (
            <MovieTrailer trailerUrl={trailerUrl} title={title} />
          ) : (
            <motion.img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>

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
            {isExpanded && (
              <MovieDetailsExpanded
                title={title}
                year={year}
                description={description}
                rating={rating}
                genre={genre}
                tags={tags}
                onWatchTrailer={() => setShowTrailer(!showTrailer)}
                showTrailer={showTrailer}
              />
            )}
          </AnimatePresence>

          {isExpanded && (
            <MovieActions userRating={userRating} onRate={handleRating} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};