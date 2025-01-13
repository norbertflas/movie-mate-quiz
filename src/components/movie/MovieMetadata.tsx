import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";

interface MovieMetadataProps {
  year: string;
  genre: string;
  rating: number;
}

export const MovieMetadata = ({ year, genre, rating }: MovieMetadataProps) => {
  const { t } = useTranslation();

  return (
    <Card className="p-4 bg-background/50 backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("movie.releaseYear")}</p>
          <p className="font-medium">{year}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("movie.genre")}</p>
          <p className="font-medium">{t(`movie.${genre.toLowerCase()}`)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("movie.rating")}</p>
          <p className="font-medium">{rating}%</p>
        </div>
      </div>
    </Card>
  );
};