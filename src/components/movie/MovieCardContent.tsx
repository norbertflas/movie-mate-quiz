import { CardContent } from "../ui/card";
import { MovieStreamingServices } from "./MovieStreamingServices";
import { MovieExpandedContent } from "./MovieExpandedContent";
import { AnimatePresence } from "framer-motion";

interface MovieCardContentProps {
  streamingServices: string[];
  isExpanded: boolean;
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tags?: string[];
  showTrailer: boolean;
  onWatchTrailer: () => void;
  userRating: "like" | "dislike" | null;
  onRate: (rating: "like" | "dislike") => void;
  tmdbId?: number;
}

export const MovieCardContent = ({
  streamingServices,
  isExpanded,
  title,
  year,
  description,
  rating,
  genre,
  tags,
  showTrailer,
  onWatchTrailer,
  userRating,
  onRate,
  tmdbId,
}: MovieCardContentProps) => {
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
          onWatchTrailer={onWatchTrailer}
          userRating={userRating}
          onRate={onRate}
          tmdbId={tmdbId}
        />
      </AnimatePresence>
    </CardContent>
  );
};