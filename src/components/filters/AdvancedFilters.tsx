
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FilterContent } from "./FilterContent";

interface AdvancedFiltersProps {
  userPreferences?: any;
  onPreferencesUpdate?: (preferences: any) => void;
}

const AdvancedFilters = ({ userPreferences, onPreferencesUpdate }: AdvancedFiltersProps) => {
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
          currentFilters={{}}
          onFilterChange={() => {}}
          isMobile={false}
        />
      </Card>
    </motion.div>
  );
};

export default AdvancedFilters;
