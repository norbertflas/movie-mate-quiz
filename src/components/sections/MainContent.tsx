
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { SearchBar } from "../SearchBar";
import { TrendingMoviesSection } from "./TrendingMoviesSection";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies, getPopularMovies } from "@/services/tmdb/trending";
import { PopularMoviesSection } from "./PopularMoviesSection";
import { LoadingState } from "@/components/LoadingState";
import { Film } from "lucide-react";

export const MainContent = () => {
  const { t } = useTranslation();
  
  const { data: trendingMovies = [], isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trendingMovies', 'US', '1'],
    queryFn: getTrendingMovies,
  });

  const { data: popularMovies = [], isLoading: isPopularLoading } = useQuery({
    queryKey: ['popularMovies', 'US', '1'],
    queryFn: getPopularMovies,
  });

  const isLoading = isTrendingLoading || isPopularLoading;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-blue-200/20 dark:border-blue-800/20 hover:shadow-2xl transition-all duration-300">
          <motion.div variants={itemVariants} className="flex items-center space-x-2 mb-6">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500">
              {t("site.findYourMovie")}
            </h1>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Film className="h-6 w-6 text-primary/80" />
            </motion.div>
          </motion.div>
          <SearchBar />
        </Card>
      </motion.div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-xl">
            <TrendingMoviesSection movies={trendingMovies} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-xl">
            <PopularMoviesSection movies={popularMovies} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
