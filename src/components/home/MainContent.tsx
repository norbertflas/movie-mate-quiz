import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { HomeHeader } from "./HomeHeader";
import { ContentSection } from "@/components/sections/ContentSection";
import { MovieFilterSection } from "@/components/sections/MovieFilterSection";
import type { MovieFilters } from "@/components/MovieFilters";
import type { TMDBMovie } from "@/services/tmdb";

interface MainContentProps {
  onStartQuiz: () => void;
  filteredMovies: TMDBMovie[];
  isLoading: boolean;
  onFilterChange: (filters: MovieFilters) => void;
}

export const MainContent = ({
  onStartQuiz,
  filteredMovies,
  isLoading,
  onFilterChange,
}: MainContentProps) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-blue-200/20 dark:border-blue-800/20 hover:shadow-2xl transition-all duration-300">
          <HomeHeader onStartQuiz={onStartQuiz} />
        </Card>
      </motion.div>

      <ContentSection />
      
      <MovieFilterSection 
        movies={filteredMovies}
        isLoading={isLoading}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};