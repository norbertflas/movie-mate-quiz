import { ThumbsUp, ThumbsDown, Play } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { MovieGoogleSearch } from "./MovieGoogleSearch";

interface MovieActionsProps {
  userRating: "like" | "dislike" | null;
  showTrailer: boolean;
  onToggleTrailer: (e: React.MouseEvent) => void;
  onRate: (rating: "like" | "dislike", e: React.MouseEvent) => void;
  title: string;
}

export const MovieActions = ({
  userRating,
  showTrailer,
  onToggleTrailer,
  onRate,
  title
}: MovieActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant={userRating === "like" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={(e) => onRate("like", e)}
        >
          <ThumbsUp className={`h-4 w-4 ${userRating === "like" ? "fill-current" : ""}`} />
        </Button>
        <Button
          variant={userRating === "dislike" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={(e) => onRate("dislike", e)}
        >
          <ThumbsDown className={`h-4 w-4 ${userRating === "dislike" ? "fill-current" : ""}`} />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center gap-2"
        onClick={onToggleTrailer}
      >
        <Play className="h-4 w-4" />
        {showTrailer ? t("hideTrailer") : t("watchTrailer")}
      </Button>
      <MovieGoogleSearch title={title} />
    </div>
  );
};