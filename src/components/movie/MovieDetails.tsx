import { motion } from "framer-motion";
import { MovieRating } from "./MovieRating";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface MovieDetailsProps {
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tags?: string[];
  onWatchTrailer: () => void;
  showTrailer: boolean;
}

export const MovieDetails = ({
  title,
  year,
  description,
  rating,
  genre,
  tags,
  onWatchTrailer,
  showTrailer,
}: MovieDetailsProps) => {
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
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{year}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{genre}</span>
        </div>
        <MovieRating rating={rating} />
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onWatchTrailer}
      >
        {showTrailer ? t("hideTrailer") : t("watchTrailer")}
      </Button>
    </motion.div>
  );
};