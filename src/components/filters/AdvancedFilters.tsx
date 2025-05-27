
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FilterContent } from "./FilterContent";
import type { MovieFilters } from "@/components/MovieFilters";

interface AdvancedFiltersProps {
  userPreferences?: any;
  onPreferencesUpdate?: (preferences: any) => void;
}

const AdvancedFilters = ({ userPreferences, onPreferencesUpdate }: AdvancedFiltersProps) => {
  const currentYear = new Date().getFullYear();
  
  const defaultFilters: MovieFilters = {
    yearRange: [2000, currentYear],
    minRating: 0
  };

  const handleFilterChange = (filters: MovieFilters) => {
    // Handle filter changes
    console.log('Filters changed:', filters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
        <FilterContent 
          currentFilters={defaultFilters}
          onFilterChange={handleFilterChange}
          isMobile={false}
        />
      </Card>
    </motion.div>
  );
};

export default AdvancedFilters;
