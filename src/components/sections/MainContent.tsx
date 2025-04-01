
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { SearchBar } from "../SearchBar";
import { TrendingMoviesSection } from "./TrendingMoviesSection";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies, getPopularMovies } from "@/services/tmdb/trending";
import { PopularMoviesSection } from "./PopularMoviesSection";
import { LoadingState } from "@/components/LoadingState";
import { Film, Sparkles } from "lucide-react";

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
      <motion.div variants={itemVariants} className="relative">
        <Card className="hero-section p-8 shadow-xl">
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight whitespace-normal">
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Find your perfect movie
              </span>
            </h1>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-primary/80" />
            </motion.div>
          </motion.div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <SearchBar />
          </div>
          
          <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
            <Film className="w-72 h-72 text-primary/20" />
          </div>
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
