import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MovieSocialShare } from "./MovieSocialShare";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Play } from "lucide-react";

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

          {explanations && explanations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("movie.whyRecommended")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {explanations.map((explanation, index) => (
                  <li key={index}>{explanation}</li>
                ))}
              </ul>
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