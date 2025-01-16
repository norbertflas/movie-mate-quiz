import { useState } from "react";
import { useToast } from "../ui/use-toast";

export const useMovieRating = (title: string) => {
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const { toast } = useToast();

  const handleRating = (rating: "like" | "dislike") => (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserRating(rating);
    toast({
      title: "Rating saved",
      description: `You ${rating}d ${title}`,
    });
  };

  return { userRating, handleRating };
};