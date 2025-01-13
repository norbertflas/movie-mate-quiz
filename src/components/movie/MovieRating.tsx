import { Star } from "lucide-react";

interface MovieRatingProps {
  rating: number;
}

export const MovieRating = ({ rating }: MovieRatingProps) => {
  // Convert rating to 0-5 scale for stars display
  const starRating = Math.round(rating / 20);
  
  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < starRating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-2">
        {rating.toFixed(0)}/100
      </span>
    </div>
  );
};