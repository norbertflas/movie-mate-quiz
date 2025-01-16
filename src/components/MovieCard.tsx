import { useState, useEffect, memo } from "react";
import { CardHeader } from "./ui/card";
import { MovieCardContainer } from "./movie/MovieCardContainer";
import { MovieCardContent } from "./movie/MovieCardContent";
import { MovieCardHeader } from "./movie/MovieCardHeader";
import { MovieFavoriteHandler } from "./movie/MovieFavoriteHandler";
import { MovieRatingHandler } from "./movie/MovieRatingHandler";
import { MovieMediaSection } from "./movie/MovieMediaSection";
import { Badge } from "./ui/badge";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
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
  tmdbId?: number;
  explanations?: string[];
}

const MovieCardComponent = ({
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
  explanations = [],
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const [availableStreaming, setAvailableStreaming] = useState<any[]>([]);
  const [isLoadingStreaming, setIsLoadingStreaming] = useState(false);
  const { t, i18n } = useTranslation();

  const { handleToggleFavorite } = MovieFavoriteHandler({ 
    isFavorite, 
    setIsFavorite, 
    title 
  });

  const { handleRating } = MovieRatingHandler({ 
    setUserRating, 
    title 
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchStreamingAvailability = async () => {
      if (tmdbId) {
        setIsLoadingStreaming(true);
        try {
          const data = await getStreamingAvailability(tmdbId, i18n.language.split('-')[0]);
          if (isMounted) {
            setAvailableStreaming(data);
          }
        } catch (error) {
          console.error('Error fetching streaming availability:', error);
        } finally {
          if (isMounted) {
            setIsLoadingStreaming(false);
          }
        }
      }
    };

    fetchStreamingAvailability();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [tmdbId, i18n.language]);

  const handleTrailerClick = () => {
    setShowTrailer(!showTrailer);
  };

  const handleRatingWrapper = (rating: "like" | "dislike") => (e: React.MouseEvent) => {
    handleRating(rating);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <MovieCardContainer
        isExpanded={isExpanded}
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
          <AnimatePresence>
            {explanations?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mt-2"
              >
                {explanations.map((explanation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {explanation}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {availableStreaming.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-2"
            >
              <h4 className="text-sm font-medium flex items-center gap-2">
                {t("streaming.availableOn")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("streaming.availability")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableStreaming.map((service: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge
                      variant={service.needsVpn ? "outline" : "default"}
                      className="text-xs flex items-center gap-1"
                    >
                      {service.service}
                      {service.needsVpn && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("streaming.vpnRequired", { country: service.country })}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardHeader>

        <MovieCardContent
          streamingServices={streamingServices}
          isExpanded={isExpanded}
          title={title}
          year={year}
          description={description}
          rating={rating}
          genre={genre}
          tags={tags}
          showTrailer={showTrailer}
          onWatchTrailer={handleTrailerClick}
          userRating={userRating}
          onRate={handleRatingWrapper}
          tmdbId={tmdbId}
        />
      </MovieCardContainer>
    </motion.div>
  );
};

export const MovieCard = memo(MovieCardComponent);