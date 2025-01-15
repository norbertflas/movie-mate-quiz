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

  return (
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
        {explanations?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {explanations.map((explanation, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {explanation}
              </Badge>
            ))}
          </div>
        )}
        {availableStreaming.length > 0 && (
          <div className="mt-4 space-y-2">
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
                <Badge
                  key={index}
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
              ))}
            </div>
          </div>
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
        onRate={handleRating}
        tmdbId={tmdbId}
      />
    </MovieCardContainer>
  );
};

export const MovieCard = memo(MovieCardComponent);