import { motion } from "framer-motion";

interface MovieTrailerProps {
  trailerUrl: string;
  title: string;
}

export const MovieTrailer = ({ trailerUrl, title }: MovieTrailerProps) => {
  return (
    <motion.iframe
      src={trailerUrl}
      title={`${title} trailer`}
      className="absolute inset-0 w-full h-full rounded-t-lg"
      allowFullScreen
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};