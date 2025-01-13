import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MovieTrailer } from "./movie/MovieTrailer";
import { MovieActions } from "./movie/MovieActions";
import { MovieStreamingServices } from "./movie/MovieStreamingServices";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieDetailsSection } from "./movie/MovieDetailsSection";
import { MovieImage } from "./movie/MovieImage";
import { SimilarMovies } from "./SimilarMovies";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieRatingHandler } from "./movie/MovieRatingHandler";
import { getTranslatedGenre } from "@/utils/genreTranslation";

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
  const { t } = useTranslation();

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
          {showTrailer ? (
            <MovieTrailer trailerUrl={trailerUrl} title={title} />
          ) : (
            <MovieImage imageUrl={imageUrl} title={title} />
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
              <MovieDetailsSection
                title={title}
                year={year}
                description={description}
                rating={rating}
                genre={getTranslatedGenre(genre, t)}
                tags={tags?.map(tag => getTranslatedGenre(tag, t))}
                onWatchTrailer={() => setShowTrailer(!showTrailer)}
                showTrailer={showTrailer}
              />
            )}
          </AnimatePresence>

          {isExpanded && (
            <>
              <MovieActions userRating={userRating} onRate={handleRating} />
              {tmdbId && <SimilarMovies currentMovie={{ title, year, genre, tags, tmdbId }} />}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};