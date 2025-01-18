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
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";

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

interface MovieInsights {
  themes: string[];
  contentWarnings: string[];
  similarMovies: string[];
  targetAudience: string;
  analysis: string;
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
  const [insights, setInsights] = useState<MovieInsights | null>(null);
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  const { userRating, handleRating } = useMovieRating(title);

  useEffect(() => {
    const fetchStreamingServices = async () => {
      if (tmdbId) {
        try {
          const services = await getStreamingAvailability(tmdbId, i18n.language.split('-')[0]);
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
  }, [tmdbId, i18n.language, toast, t]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (isExpanded && !insights) {
        try {
          const { data, error } = await supabase.functions.invoke('movie-insights', {
            body: { title, description, genre }
          });

          if (error) throw error;
          setInsights(data);
        } catch (error) {
          console.error('Error fetching movie insights:', error);
          toast({
            title: t("errors.aiInsights"),
            description: t("errors.tryAgain"),
            variant: "destructive",
          });
        }
      }
    };

    fetchInsights();
  }, [isExpanded, title, description, genre, toast, t, insights]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTrailerToggle = () => {
    setShowTrailer(!showTrailer);
  };

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
            onToggleFavorite={() => setIsFavorite(!isFavorite)}
          />
        </CardHeader>

        <CardContent className="space-y-4 flex-grow p-4">
          {availableServices.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t("availableOn")}:
              </span>
              {availableServices.map((service) => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          )}
          
          <MovieExpandedContent
            isExpanded={isExpanded}
            title={title}
            year={year}
            description={description}
            rating={rating > 1 ? rating : rating * 100}
            genre={t(`movie.${genre.toLowerCase()}`)}
            tags={tags?.map(tag => t(`movie.${tag.toLowerCase()}`))}
            showTrailer={showTrailer}
            onWatchTrailer={handleTrailerToggle}
            userRating={userRating}
            onRate={handleRating}
            tmdbId={tmdbId}
            explanations={explanations}
            streamingServices={availableServices}
            insights={insights}
          />
        </CardContent>
      </MovieCardContainer>
    </motion.div>
  );
};