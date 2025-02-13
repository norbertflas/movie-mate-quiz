
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { InfiniteMovieList } from "../movie/InfiniteMovieList";
import { SearchBar } from "../SearchBar";
import { TrendingMoviesSection } from "./TrendingMoviesSection";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies } from "@/services/tmdb/trending";

export const MainContent = () => {
  const { t } = useTranslation();
  
  const { data: trendingMovies = [] } = useQuery({
    queryKey: ['trendingMovies', 'US', '1'],
    queryFn: getTrendingMovies,
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-blue-200/20 dark:border-blue-800/20 hover:shadow-2xl transition-all duration-300">
          <h1 className="text-3xl font-bold tracking-tight gradient-text mb-6">
            {t("site.description")}
          </h1>
          <SearchBar />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-panel p-6 rounded-xl"
      >
        <TrendingMoviesSection movies={trendingMovies} />
      </motion.div>
      
      <section className="glass-panel p-6 rounded-xl w-full">
        <h2 className="text-2xl font-bold mb-6 gradient-text">{t("discover.popular")}</h2>
        <div className="w-full max-h-[800px] overflow-y-auto">
          <InfiniteMovieList />
        </div>
      </section>
    </div>
  );
};
