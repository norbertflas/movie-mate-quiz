
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
      <h3 className="text-lg font-bold line-clamp-1">
        {title}
      </h3>
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
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </Button>
      </motion.div>
    </div>
  );
};
