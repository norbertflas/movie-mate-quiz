import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { FilterHeader } from "./filters/FilterHeader";
import { FilterContent } from "./filters/FilterContent";
import { MobileFilterSheet } from "./filters/MobileFilterSheet";

export interface MovieFilters {
  platform?: string;
  genre?: string;
  yearRange: [number, number];
  minRating: number;
  tags?: string[];
}

interface MovieFiltersProps {
  onFilterChange: (filters: MovieFilters) => void;
}

export const MovieFilters = ({ onFilterChange }: MovieFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [currentFilters, setCurrentFilters] = useState<MovieFilters>({
    yearRange: [2000, currentYear],
    minRating: 0,
  });

  const handleFilterChange = (filters: MovieFilters) => {
    setCurrentFilters(filters);
    onFilterChange(filters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.platform) count++;
    if (currentFilters.genre) count++;
    if (currentFilters.yearRange[0] !== 2000 || currentFilters.yearRange[1] !== currentYear) count++;
    if (currentFilters.minRating > 0) count++;
    if (currentFilters.tags?.length) count++;
    return count;
  };

  if (isMobile) {
    return (
      <MobileFilterSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        activeFiltersCount={getActiveFiltersCount()}
        onFilterChange={handleFilterChange}
        currentFilters={currentFilters}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 bg-card rounded-lg border"
    >
      <FilterHeader activeFiltersCount={getActiveFiltersCount()} />
      <FilterContent
        onFilterChange={handleFilterChange}
        currentFilters={currentFilters}
      />
    </motion.div>
  );
};