import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MovieStreamingServices } from "./movie/MovieStreamingServices";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { motion } from "framer-motion";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieRatingHandler } from "./movie/MovieRatingHandler";
import { MovieMediaSection } from "./movie/MovieMediaSection";
import { MovieMetadata } from "./movie/MovieMetadata";
import { MovieDescription } from "./movie/MovieDescription";
import { MovieTags } from "./movie/MovieTags";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

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
        className="overflow-hidden group cursor-pointer h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20 hover:shadow-xl transition-all duration-300" 
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
          
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <MovieMetadata
                year={year}
                genre={genre}
                rating={rating}
              />
              
              <MovieDescription description={description} />
              
              <MovieTags tags={tags || []} />

              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTrailer(!showTrailer);
                }}
              >
                {showTrailer ? t("hideTrailer") : t("watchTrailer")}
              </Button>

              <div className="flex justify-center gap-4">
                <Button
                  variant={userRating === "like" ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 ${
                    userRating === "like"
                      ? "bg-green-600/20 hover:bg-green-600/30 text-green-400"
                      : "border-gray-700 hover:bg-gray-800/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRating("like");
                  }}
                >
                  {t("movie.like")}
                </Button>
                <Button
                  variant={userRating === "dislike" ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 ${
                    userRating === "dislike"
                      ? "bg-red-600/20 hover:bg-red-600/30 text-red-400"
                      : "border-gray-700 hover:bg-gray-800/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRating("dislike");
                  }}
                >
                  {t("movie.dislike")}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};