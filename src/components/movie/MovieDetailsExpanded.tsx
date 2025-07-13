import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MovieRating } from "./MovieRating";
import { useTranslation } from "react-i18next";

interface MovieDetailsExpandedProps {
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tags?: string[];
  onWatchTrailer: () => void;
  showTrailer: boolean;
}

export const MovieDetailsExpanded = ({
  title,
  year,
  description,
  rating,
  genre,
  tags,
  onWatchTrailer,
  showTrailer,
}: MovieDetailsExpandedProps) => {
  const { t } = useTranslation();

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
          {title}
        </motion.h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{year}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{genre}</span>
        </div>
        <MovieRating rating={rating} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 hover:line-clamp-none transition-all duration-300">
        {description}
      </p>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="animate-fade-in">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="w-full animate-fade-in"
        onClick={onWatchTrailer}
      >
        {showTrailer ? t("hideTrailer") : t("watchTrailer")}
      </Button>
    </motion.div>
  );
};