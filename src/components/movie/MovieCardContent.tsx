import { CardContent } from "../ui/card";
import { MovieStreamingServices } from "./MovieStreamingServices";
import { MovieExpandedContent } from "./MovieExpandedContent";
import { AnimatePresence } from "framer-motion";
import { useCallback } from "react";
import type { MovieCardContentProps } from "@/types/movie";

export const MovieCardContent = ({
  streamingServices = [],
  isExpanded = false,
  title,
  year,
  description,
  rating,
  genre,
  tags,
  showTrailer = false,
  onWatchTrailer,
  userRating,
  onRate,
  tmdbId,
  explanations,
}: MovieCardContentProps) => {
  const handleWatchTrailer = useCallback(() => {
    onWatchTrailer?.();
  }, [onWatchTrailer]);

  const handleRate = useCallback((rating: "like" | "dislike") => (e: React.MouseEvent) => {
    onRate?.(rating)(e);
  }, [onRate]);

  return (
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
          onWatchTrailer={handleWatchTrailer}
          userRating={userRating}
          onRate={handleRate}
          tmdbId={tmdbId}
          explanations={explanations}
        />
      </AnimatePresence>
    </CardContent>
  );
};