import { motion } from "framer-motion";
import { MovieRating } from "./MovieRating";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface MovieDetailsSectionProps {
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tags?: string[];
  onWatchTrailer: () => void;
  showTrailer: boolean;
}

export const MovieDetailsSection = ({
  title,
  year,
  description,
  rating,
  genre,
  tags,
  onWatchTrailer,
  showTrailer,
}: MovieDetailsSectionProps) => {
  const { t } = useTranslation();

  const getTranslatedGenre = (genre: string) => {
    const genreKey = genre.toLowerCase().replace(/[\s-]/g, '');
    return t(`movie.${genreKey}`, genre);
  };

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
          <span className="text-sm text-muted-foreground">
            {t("movie.releaseYear")}: {year}
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {t("movie.genre")}: {getTranslatedGenre(genre)}
          </span>
        </div>
        <MovieRating rating={rating} />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">{t("movie.description")}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {getTranslatedGenre(tag)}
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