import { useState } from "react";

export const useMovieRating = (title: string) => {
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);

  const handleRating = (rating: "like" | "dislike") => (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserRating(rating);
    // Add any additional rating logic here
  };

  return { userRating, handleRating };
};