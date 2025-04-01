
import React from "react";

interface MovieRatingProps {
  rating: number;
}

export const MovieRating = ({ rating }: MovieRatingProps) => {
  // Convert rating to percentage if it's on a 10-point scale
  const normalizedRating = rating > 10 ? rating : rating * 10;
  
  // Determine color based on rating
  let ratingColor;
  if (normalizedRating >= 70) ratingColor = "text-green-500";
  else if (normalizedRating >= 50) ratingColor = "text-yellow-500";
  else ratingColor = "text-red-500";

  return (
    <div className="inline-flex items-center">
      <div className={`text-sm font-semibold ${ratingColor}`}>
        {Math.round(normalizedRating)}%
      </div>
    </div>
  );
};
