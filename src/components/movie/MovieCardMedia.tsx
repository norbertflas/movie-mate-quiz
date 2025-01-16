import { motion } from "framer-motion";
import { MovieMediaSection } from "./MovieMediaSection";

interface MovieCardMediaProps {
  showTrailer: boolean;
  trailerUrl: string;
  imageUrl: string;
  title: string;
}

export const MovieCardMedia = ({
  showTrailer,
  trailerUrl,
  imageUrl,
  title,
}: MovieCardMediaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <MovieMediaSection
        showTrailer={showTrailer}
        trailerUrl={trailerUrl}
        imageUrl={imageUrl}
        title={title}
      />
    </motion.div>
  );
};