
import { motion } from "framer-motion";
import { MovieCardSkeleton } from "./skeletons/MovieCardSkeleton";
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-center items-center py-4">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <MovieCardSkeleton />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
