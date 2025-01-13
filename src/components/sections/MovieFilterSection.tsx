import { MovieSection } from "@/components/home/MovieSection";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import type { TMDBMovie } from "@/services/tmdb";

interface MovieFilterSectionProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  onFilterChange: (filters: MovieFiltersType) => void;
}

export const MovieFilterSection = ({ movies, isLoading, onFilterChange }: MovieFilterSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
        <MovieSection 
          movies={movies}
          isLoading={isLoading}
          onFilterChange={onFilterChange}
        />
      </Card>
    </motion.div>
  );
};