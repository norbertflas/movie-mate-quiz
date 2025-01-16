import { useState, useEffect } from "react";
import { CardHeader, CardContent } from "./ui/card";
import { MovieCardContainer } from "./movie/MovieCardContainer";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieCardMedia } from "./movie/MovieCardMedia";
import { MovieStreamingServices } from "./movie/MovieStreamingServices";
import { MovieExpandedContent } from "./movie/MovieExpandedContent";
import { useMovieRating } from "./movie/MovieRatingLogic";
import { motion } from "framer-motion";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { getMovieTrailer } from "@/services/youtube";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

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
  explanations?: string[];
}

export const MovieCard = ({
  title,
  year,
  platform,
  genre,
  imageUrl,
  description,
  trailerUrl: initialTrailerUrl,
  rating,
  tags,
  streamingServices = [],
  tmdbId,
  explanations = [],
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [trailerUrl, setTrailerUrl] = useState(initialTrailerUrl);
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const { userRating, handleRating } = useMovieRating(title);
  const { handleToggleFavorite } = MovieFavoriteHandler({ 
    isFavorite, 
    setIsFavorite, 
    title 
  });

  useEffect(() => {
    const fetchStreamingServices = async () => {
      if (tmdbId) {
        try {
          const services = await getStreamingAvailability(tmdbId);
          setAvailableServices(services.map(s => s.service));
        } catch (error) {
          console.error('Error fetching streaming services:', error);
          toast({
            title: t("errors.streamingServices"),
            description: t("errors.tryAgain"),
            variant: "destructive",
          });
        }
      }
    };

    fetchStreamingServices();
  }, [tmdbId, toast, t]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (showTrailer && !trailerUrl) {
        try {
          const url = await getMovieTrailer(title, year);
          setTrailerUrl(url);
          if (!url) {
            toast({
              title: t("errors.trailerNotFound"),
              description: t("errors.tryAgain"),
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error fetching trailer:', error);
          toast({
            title: t("errors.trailerError"),
            description: t("errors.tryAgain"),
            variant: "destructive",
          });
        }
      }
    };

    fetchTrailer();
  }, [showTrailer, title, year, trailerUrl, toast, t]);

  const handleTrailerToggle = () => {
    setShowTrailer(!showTrailer);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Normalize rating to be between 0-100
  const normalizedRating = rating > 1 ? rating : rating * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full relative"
    >
      <MovieCardContainer
        isExpanded={isExpanded}
        onClick={handleExpand}
      >
        <MovieCardMedia
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
          <MovieStreamingServices services={availableServices} />
          
          <MovieExpandedContent
            isExpanded={isExpanded}
            title={title}
            year={year}
            description={description}
            rating={normalizedRating}
            genre={t(`movie.${genre.toLowerCase()}`)}
            tags={tags?.map(tag => t(`movie.${tag.toLowerCase()}`))}
            showTrailer={showTrailer}
            onWatchTrailer={handleTrailerToggle}
            userRating={userRating}
            onRate={handleRating}
            tmdbId={tmdbId}
            explanations={explanations}
          />
        </CardContent>
      </MovieCardContainer>
    </motion.div>
  );
};