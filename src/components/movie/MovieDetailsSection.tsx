import { motion } from "framer-motion";
import { MovieRating } from "./MovieRating";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { Card } from "../ui/card";

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
          className="text-2xl font-bold tracking-tight"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.h3>
        
        <Card className="p-4 bg-background/50 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("movie.releaseYear")}</p>
              <p className="font-medium">{year}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("movie.genre")}</p>
              <p className="font-medium">{genre}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground mb-1">{t("movie.rating")}</p>
              <MovieRating rating={rating} />
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-medium text-lg">{t("movie.description")}</h4>
        <p className="text-sm text-muted-foreground line-clamp-3 hover:line-clamp-none transition-all duration-300">
          {description}
        </p>
      </div>

      {tags && tags.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-lg">{t("movie.tags")}</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="animate-fade-in">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="secondary"
        size="lg"
        className="w-full animate-fade-in"
        onClick={onWatchTrailer}
      >
        {showTrailer ? t("hideTrailer") : t("watchTrailer")}
      </Button>
    </motion.div>
  );
};