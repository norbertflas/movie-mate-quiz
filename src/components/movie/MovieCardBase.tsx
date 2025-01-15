import { memo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { MovieImage } from "./MovieImage";
import { MovieCardContent } from "./MovieCardContent";
import type { MovieCardProps } from "@/types/movie";
import { useToast } from "../ui/use-toast";
import { motion } from "framer-motion";

const MovieCardBase = ({ 
  title,
  year,
  platform,
  genre,
  imageUrl,
  description,
  trailerUrl,
  rating,
  tmdbId,
  explanations,
}: MovieCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const { toast } = useToast();

  const handleCardClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleWatchTrailer = useCallback(() => {
    if (!trailerUrl) {
      toast({
        title: "No trailer available",
        description: "Sorry, there's no trailer available for this movie.",
        variant: "destructive",
      });
      return;
    }
    setShowTrailer(!showTrailer);
  }, [showTrailer, trailerUrl, toast]);

  const handleRate = useCallback((rating: "like" | "dislike") => (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserRating(rating);
    toast({
      title: "Rating saved",
      description: `You ${rating}d ${title}`,
    });
  }, [title, toast]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer" 
        onClick={handleCardClick}
      >
        <div className="aspect-[2/3] overflow-hidden">
          <MovieImage
            imageUrl={imageUrl}
            title={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            width={300}
            height={450}
          />
        </div>
        <MovieCardContent
          title={title}
          year={year}
          description={description}
          rating={rating}
          genre={genre}
          tmdbId={tmdbId}
          explanations={explanations}
          isExpanded={isExpanded}
          showTrailer={showTrailer}
          onWatchTrailer={handleWatchTrailer}
          userRating={userRating}
          onRate={handleRate}
        />
      </Card>
    </motion.div>
  );
};

MovieCardBase.displayName = "MovieCardBase";

export { MovieCardBase };