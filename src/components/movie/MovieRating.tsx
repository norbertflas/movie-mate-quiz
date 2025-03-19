
import { Star } from "lucide-react";
import { Progress } from "../ui/progress";
import { motion } from "framer-motion";

interface MovieRatingProps {
  rating: number;
}

export const MovieRating = ({ rating }: MovieRatingProps) => {
  const starRating = Math.round(rating / 20);
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < starRating 
              ? "text-yellow-400 fill-yellow-400" 
              : "text-gray-300 dark:text-gray-600"
            } 
          />
        ))}
      </div>
      <span className="text-xs font-medium">
        {rating.toFixed(0)}%
      </span>
    </div>
  );
};
