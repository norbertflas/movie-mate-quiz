import { Button } from "../ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface MovieActionsProps {
  userRating: "like" | "dislike" | null;
  onRate: (rating: "like" | "dislike") => void;
}

export const MovieActions = ({ userRating, onRate }: MovieActionsProps) => {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant={userRating === "like" ? "default" : "outline"}
        size="sm"
        onClick={() => onRate("like")}
      >
        <ThumbsUp className="h-4 w-4 mr-2" />
        Podoba mi się
      </Button>
      <Button
        variant={userRating === "dislike" ? "default" : "outline"}
        size="sm"
        onClick={() => onRate("dislike")}
      >
        <ThumbsDown className="h-4 w-4 mr-2" />
        Nie podoba mi się
      </Button>
    </div>
  );
};