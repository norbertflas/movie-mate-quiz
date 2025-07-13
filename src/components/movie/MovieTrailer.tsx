import { motion } from "framer-motion";

interface MovieTrailerProps {
  trailerUrl: string;
  title: string;
}

export const MovieTrailer = ({ trailerUrl, title }: MovieTrailerProps) => {
  return (
    <motion.div
      className="relative w-full h-full aspect-video"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <iframe
        src={trailerUrl}
        title={`${title} trailer`}
        className="absolute inset-0 w-full h-full rounded-t-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </motion.div>
  );
};