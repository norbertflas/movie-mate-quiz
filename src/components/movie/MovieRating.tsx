import { Star } from "lucide-react";
import { Progress } from "../ui/progress";
import { motion } from "framer-motion";

interface MovieRatingProps {
  rating: number;
}

export const MovieRating = ({ rating }: MovieRatingProps) => {
  const starRating = Math.round(rating / 20);
  
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Star
              className={`h-4 w-4 ${
                index < starRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </motion.div>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {rating.toFixed(0)}/100
        </span>
      </div>
      <Progress 
        value={rating} 
        className="h-1 bg-gray-200 dark:bg-gray-700"
      />
    </motion.div>
  );
};