
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MovieRating } from "./MovieRating";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "../ui/scroll-area";

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
  onRate?: (rating: "like" | "dislike") => void;
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
}: MovieExpandedContentProps) => {
  const { t } = useTranslation();

  if (!isExpanded) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col space-y-2">
        <motion.h3 
          className="text-xl font-semibold"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {title} ({year})
        </motion.h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{genre}</span>
          <MovieRating rating={rating} />
        </div>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-4">
        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="space-y-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onWatchTrailer}
          className="w-full"
        >
          {showTrailer ? t("hideTrailer") : t("watchTrailer")}
        </Button>

        {userRating !== undefined && onRate && (
          <div className="flex gap-2">
            <Button
              variant={userRating === "like" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onRate("like")}
            >
              {t("actions.like")}
            </Button>
            <Button
              variant={userRating === "dislike" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onRate("dislike")}
            >
              {t("actions.dislike")}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
