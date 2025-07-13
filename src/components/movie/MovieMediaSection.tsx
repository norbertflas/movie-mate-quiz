import { motion, AnimatePresence } from "framer-motion";
import { MovieTrailer } from "./MovieTrailer";
import { MovieImage } from "./MovieImage";

interface MovieMediaSectionProps {
  showTrailer: boolean;
  trailerUrl: string;
  imageUrl: string;
  title: string;
}

export const MovieMediaSection = ({
  showTrailer,
  trailerUrl,
  imageUrl,
  title,
}: MovieMediaSectionProps) => {
  return (
    <motion.div 
      className="aspect-video relative overflow-hidden rounded-t-lg"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {showTrailer ? (
          <MovieTrailer trailerUrl={trailerUrl} title={title} />
        ) : (
          <MovieImage imageUrl={imageUrl} title={title} />
        )}
      </AnimatePresence>
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.div>
  );
};