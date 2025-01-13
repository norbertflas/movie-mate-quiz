import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { MovieDetails } from "./movie/MovieDetails";
import { MovieTrailer } from "./movie/MovieTrailer";
import { MovieActions } from "./movie/MovieActions";
import { StreamingServices } from "./movie/StreamingServices";
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
    >
      <Card className="overflow-hidden group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="aspect-video relative overflow-hidden">
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
        </div>

        <CardHeader className="space-y-1">
          <div className="flex justify-between items-start">
            <motion.h3
              className="text-xl font-semibold line-clamp-1"
              whileHover={{ scale: 1.02 }}
            >
              {title}
            </motion.h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="h-8 w-8"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
                }`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <StreamingServices services={streamingServices} />

          <AnimatePresence>
            {isExpanded && (
              <MovieDetails
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