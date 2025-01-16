import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface MovieDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    title: string;
    overview: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
  } | null;
}

export const MovieDetailsDialog = ({ isOpen, onClose, movie }: MovieDetailsDialogProps) => {
  const { t } = useTranslation();

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dialog-content">
        <div className="flex justify-between items-start mb-4">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            {movie.title}
          </motion.h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <motion.img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
              alt={movie.title}
              className="object-cover w-full h-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-semibold text-lg mb-2">{t("movie.overview")}</h3>
              <p className="text-muted-foreground">{movie.overview}</p>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-sm text-muted-foreground">
                {new Date(movie.release_date).getFullYear()}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {(movie.vote_average * 10).toFixed(0)}%
              </span>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};