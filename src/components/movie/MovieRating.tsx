import { Star } from "lucide-react";

interface MovieRatingProps {
  rating: number;
}

export const MovieRating = ({ rating }: MovieRatingProps) => {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating / 2
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-2">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};