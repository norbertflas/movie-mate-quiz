import { motion } from "framer-motion";
import { MovieCardSkeleton } from "./skeletons/MovieCardSkeleton";

export const LoadingState = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    >
      {[...Array(8)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </motion.div>
  );
};