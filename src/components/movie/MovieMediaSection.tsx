import { motion } from "framer-motion";
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
      className="aspect-video relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {showTrailer ? (
        <MovieTrailer trailerUrl={trailerUrl} title={title} />
      ) : (
        <MovieImage imageUrl={imageUrl} title={title} />
      )}
    </motion.div>
  );
};