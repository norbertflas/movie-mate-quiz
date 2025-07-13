import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MovieDetailsSection } from "./MovieDetailsSection";
import { MovieActions } from "./MovieActions";
import { motion, AnimatePresence } from "framer-motion";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    title: string;
    year: string;
    description: string;
    rating: number;
    genre: string;
    tags?: string[];
    imageUrl: string;
    trailerUrl: string;
  };
}

export const QuickViewModal = ({ isOpen, onClose, movie }: QuickViewModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{movie.title}</DialogTitle>
            </DialogHeader>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="relative aspect-video">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
              
              <div className="space-y-4">
                <MovieDetailsSection
                  title={movie.title}
                  year={movie.year}
                  description={movie.description}
                  rating={movie.rating}
                  genre={movie.genre}
                  tags={movie.tags}
                  onWatchTrailer={() => {}}
                  showTrailer={false}
                />
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};