
import React from "react";

interface MovieRatingProps {
  rating: number;
}

export const MovieRating = ({ rating }: MovieRatingProps) => {
  // Convert rating to percentage if it's on a 10-point scale
  const normalizedRating = rating > 10 ? rating : rating * 10;
  
  // Determine color based on rating
  let ratingColor;
  let bgColor;
  
  if (normalizedRating >= 75) {
    ratingColor = "text-green-500";
    bgColor = "bg-green-950/30"; 
  } else if (normalizedRating >= 60) {
    ratingColor = "text-lime-500";
    bgColor = "bg-lime-950/30";
  } else if (normalizedRating >= 40) {
    ratingColor = "text-yellow-500";
    bgColor = "bg-yellow-950/30";
  } else {
    ratingColor = "text-red-500";
    bgColor = "bg-red-950/30";
  }

  return (
    <div className={`inline-flex items-center justify-center rounded-full ${bgColor} min-w-[40px] h-[26px] px-2`}>
      <div className={`text-sm font-semibold ${ratingColor}`}>
        {Math.round(normalizedRating)}%
      </div>
    </div>
  );
};
