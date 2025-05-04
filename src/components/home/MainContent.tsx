
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ContentSection } from "@/components/sections/ContentSection";
import { MovieFilterSection } from "@/components/sections/MovieFilterSection";
import type { MovieFilters } from "@/components/MovieFilters";
import type { TMDBMovie } from "@/services/tmdb";

interface MainContentProps {
  onStartQuiz?: () => void;
  filteredMovies?: TMDBMovie[];
  isLoading?: boolean;
  onFilterChange?: (filters: MovieFilters) => void;
}

export const MainContent = ({
  onStartQuiz,
  filteredMovies = [],
  isLoading = false,
  onFilterChange,
}: MainContentProps) => {
  return (
    <div className="space-y-8">
      <ContentSection />
      
      {onFilterChange && (
        <MovieFilterSection 
          movies={filteredMovies}
          isLoading={isLoading}
          onFilterChange={onFilterChange}
        />
      )}
    </div>
  );
};
