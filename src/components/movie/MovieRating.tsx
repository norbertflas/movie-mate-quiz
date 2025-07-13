
import React from "react";
import { Star } from "lucide-react";

interface MovieRatingProps {
  rating: number;
  size?: "sm" | "default" | "lg";
}

export const MovieRating = ({ rating, size = "default" }: MovieRatingProps) => {
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

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "min-w-[32px] h-[20px] px-1",
      text: "text-xs",
      icon: "h-2.5 w-2.5"
    },
    default: {
      container: "min-w-[40px] h-[26px] px-2",
      text: "text-sm",
      icon: "h-3 w-3"
    },
    lg: {
      container: "min-w-[48px] h-[32px] px-3",
      text: "text-base",
      icon: "h-4 w-4"
    }
  };

  const config = sizeConfig[size];

  if (size === "sm") {
    return (
      <div className="flex items-center space-x-1">
        <Star className={`${config.icon} text-yellow-400 fill-current`} />
        <span className={`font-semibold ${ratingColor} ${config.text}`}>
          {Math.round(normalizedRating)}%
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center rounded-full ${bgColor} ${config.container}`}>
      <div className={`font-semibold ${ratingColor} ${config.text}`}>
        {Math.round(normalizedRating)}%
      </div>
    </div>
  );
};
