import { motion } from "framer-motion";
import { MovieActions } from "./MovieActions";
import { MovieDetailsSection } from "./MovieDetailsSection";
import { SimilarMovies } from "../SimilarMovies";

interface MovieExpandedContentProps {
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

export const MovieExpandedContent = ({
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
}: MovieExpandedContentProps) => {
  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWatchTrailer();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? "auto" : 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <MovieDetailsSection
        title={title}
        year={year}
        description={description}
        rating={rating}
        genre={genre}
        tags={tags}
        showTrailer={showTrailer}
        onWatchTrailer={handleTrailerClick}
      />
      
      <MovieActions 
        userRating={userRating}
        showTrailer={showTrailer}
        onToggleTrailer={handleTrailerClick}
        onRate={onRate}
        title={title}
      />
      
      {tmdbId && <SimilarMovies currentMovie={{ title, year, genre, tags, tmdbId }} />}
    </motion.div>
  );
};