import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MovieSocialShare } from "./MovieSocialShare";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Play, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MovieInsights {
  themes: string[];
  contentWarnings: string[];
  similarMovies: string[];
  targetAudience: string;
  analysis: string;
}

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
  userRating?: "like" | "dislike" | null;
  onRate?: (rating: "like" | "dislike") => (e: React.MouseEvent) => void;
  tmdbId?: number;
  explanations?: string[];
  streamingServices?: string[];
  insights?: MovieInsights | null;
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
  explanations,
  streamingServices,
  insights,
}: MovieExpandedContentProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{year}</Badge>
              <Badge variant="secondary">{genre}</Badge>
              {tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {t(`movie.${tag.toLowerCase()}`)}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Progress value={rating} className="flex-1" />
              <span className="text-sm font-medium">{rating}%</span>
            </div>
          </div>

          {insights && (
            <div className="space-y-4 pt-4">
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("movie.aiInsights")}</h4>
                
                <div className="space-y-4">
                  {insights.themes.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        {t("movie.keyThemes")}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {insights.themes.map((theme, index) => (
                          <Badge key={index} variant="outline">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.contentWarnings.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t("movie.contentWarnings")}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {insights.contentWarnings.map((warning, index) => (
                          <Badge key={index} variant="destructive">
                            {warning}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">
                      {t("movie.analysis")}
                    </h5>
                    <p className="text-sm">{insights.analysis}</p>
                  </div>

                  {insights.similarMovies.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        {t("movie.similarMovies")}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {insights.similarMovies.map((movie, index) => (
                          <Badge key={index} variant="secondary">
                            {movie}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant={showTrailer ? "secondary" : "outline"}
              size="sm"
              onClick={onWatchTrailer}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {t(showTrailer ? "movie.hideTrailer" : "movie.watchTrailer")}
            </Button>

            {onRate && (
              <>
                <Button
                  variant={userRating === "like" ? "secondary" : "outline"}
                  size="sm"
                  onClick={onRate("like")}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {t("movie.like")}
                </Button>

                <Button
                  variant={userRating === "dislike" ? "secondary" : "outline"}
                  size="sm"
                  onClick={onRate("dislike")}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  {t("movie.dislike")}
                </Button>
              </>
            )}
          </div>

          {streamingServices && streamingServices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("movie.whereToWatch")}</h4>
              <div className="flex flex-wrap gap-2">
                {streamingServices.map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <MovieSocialShare
            title={title}
            description={description}
            url={`${window.location.origin}/movie/${tmdbId}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};