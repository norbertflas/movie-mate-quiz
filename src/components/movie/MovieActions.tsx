import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { ThumbsUp, ThumbsDown, Play } from "lucide-react";

interface MovieActionsProps {
  userRating: "like" | "dislike" | null;
  showTrailer: boolean;
  onToggleTrailer: (e: React.MouseEvent) => void;
  onRate: (rating: "like" | "dislike", e: React.MouseEvent) => void;
}

export const MovieActions = ({ userRating, showTrailer, onToggleTrailer, onRate }: MovieActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Button
        variant="secondary"
        size="sm"
        className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white transition-colors"
        onClick={onToggleTrailer}
      >
        <Play className="w-4 h-4 mr-2" />
        {showTrailer ? t("hideTrailer") : t("watchTrailer")}
      </Button>

      <div className="flex justify-center gap-4">
        <Button
          variant={userRating === "like" ? "default" : "outline"}
          size="lg"
          className={`flex-1 ${
            userRating === "like"
              ? "bg-green-600/20 hover:bg-green-600/30 text-green-400"
              : "border-gray-700 hover:bg-gray-800/50"
          }`}
          onClick={(e) => onRate("like", e)}
          title={t("movie.like")}
        >
          <ThumbsUp className={`w-5 h-5 ${userRating === "like" ? "fill-green-400" : ""}`} />
        </Button>
        <Button
          variant={userRating === "dislike" ? "default" : "outline"}
          size="lg"
          className={`flex-1 ${
            userRating === "dislike"
              ? "bg-red-600/20 hover:bg-red-600/30 text-red-400"
              : "border-gray-700 hover:bg-gray-800/50"
          }`}
          onClick={(e) => onRate("dislike", e)}
          title={t("movie.dislike")}
        >
          <ThumbsDown className={`w-5 h-5 ${userRating === "dislike" ? "fill-red-400" : ""}`} />
        </Button>
      </div>
    </div>
  );
};