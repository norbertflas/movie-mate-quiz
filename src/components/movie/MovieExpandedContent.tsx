import { SimilarMovies } from "../SimilarMovies";
import { MovieActions } from "./MovieActions";
import { MovieDetailsSection } from "./MovieDetailsSection";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getTranslatedGenre } from "@/utils/genreTranslation";

interface MovieExpandedContentProps {
  isExpanded: boolean;
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tags?: string[];
  showTrailer: boolean;
  onWatchTrailer: (e: React.MouseEvent) => void;
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
  const { t } = useTranslation();

  const handleTrailerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWatchTrailer();
  };

  return (
    <AnimatePresence mode="wait">
      {isExpanded && (
        <>
          <MovieDetailsSection
            title={title}
            year={year}
            description={description}
            rating={rating}
            genre={getTranslatedGenre(genre, t)}
            tags={tags?.map(tag => getTranslatedGenre(tag, t))}
            onWatchTrailer={onWatchTrailer}
            showTrailer={showTrailer}
          />
          <MovieActions 
            userRating={userRating} 
            onRate={onRate}
            showTrailer={showTrailer}
            onToggleTrailer={handleTrailerToggle}
            title={title}
          />
          {tmdbId && <SimilarMovies currentMovie={{ title, year, genre, tags, tmdbId }} />}
        </>
      )}
    </AnimatePresence>
  );
};