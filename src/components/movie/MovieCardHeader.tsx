import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface MovieCardHeaderProps {
  title: string;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const MovieCardHeader = ({ 
  title, 
  isFavorite, 
  onToggleFavorite 
}: MovieCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <motion.h3
        className="text-xl font-semibold line-clamp-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
        whileHover={{ scale: 1.02 }}
      >
        {title}
      </motion.h3>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          className="h-8 w-8 hover:bg-background/80"
        >
          <Heart
            className={`h-5 w-5 transition-colors duration-300 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </Button>
      </motion.div>
    </div>
  );
};