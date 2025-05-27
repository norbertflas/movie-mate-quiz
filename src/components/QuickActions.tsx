
import { Button } from "@/components/ui/button";
import { Filter, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionsProps {
  onToggleFilters: () => void;
  onToggleWatchlist: () => void;
  showAdvancedFilters: boolean;
  showWatchlist: boolean;
  userPreferences?: any;
}

export const QuickActions = ({ 
  onToggleFilters, 
  onToggleWatchlist, 
  showAdvancedFilters, 
  showWatchlist,
  userPreferences 
}: QuickActionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-4 justify-center"
    >
      <Button
        onClick={onToggleFilters}
        variant={showAdvancedFilters ? "default" : "outline"}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
      </Button>
      <Button
        onClick={onToggleWatchlist}
        variant={showWatchlist ? "default" : "outline"}
        className="flex items-center gap-2"
      >
        <Heart className="h-4 w-4" />
        Watchlist ({userPreferences?.watchlist?.length || 0})
      </Button>
    </motion.div>
  );
};
