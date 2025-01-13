import { FavoriteCreators } from "@/components/creators/FavoriteCreators";
import { MovieLists } from "@/components/movie/MovieLists";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const ContentSection = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
          <div className="mb-8">
            <FavoriteCreators />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
          <div className="mb-8">
            <MovieLists />
          </div>
        </Card>
      </motion.div>
    </>
  );
};