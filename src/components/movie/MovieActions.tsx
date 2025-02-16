
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface MovieActionsProps {
  userRating: "like" | "dislike" | null;
  onRate: (rating: "like" | "dislike", e: React.MouseEvent) => void;
  title: string;
}

export const MovieActions = ({
  userRating,
  onRate,
}: MovieActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={userRating === "like" ? "default" : "outline"}
        size="sm"
        className="w-full"
        onClick={(e) => onRate("like", e)}
      >
        <ThumbsUp className={`h-4 w-4 ${userRating === "like" ? "fill-current" : ""}`} />
      </Button>
      <Button
        variant={userRating === "dislike" ? "default" : "outline"}
        size="sm"
        className="w-full"
        onClick={(e) => onRate("dislike", e)}
      >
        <ThumbsDown className={`h-4 w-4 ${userRating === "dislike" ? "fill-current" : ""}`} />
      </Button>
    </div>
  );
};
