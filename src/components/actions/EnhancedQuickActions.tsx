
import { 
  Filter, 
  Bookmark, 
  TrendingUp, 
  Star, 
  Clock,
  Shuffle,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface EnhancedQuickActionsProps {
  onToggleFilters: () => void;
  onToggleWatchlist: () => void;
  showAdvancedFilters: boolean;
  showWatchlist: boolean;
  userPreferences: any;
}

export const EnhancedQuickActions = ({
  onToggleFilters,
  onToggleWatchlist,
  showAdvancedFilters,
  showWatchlist,
  userPreferences
}: EnhancedQuickActionsProps) => {
  const [viewMode, setViewMode] = useLocalStorage('view_mode', 'grid');
  const [sortBy, setSortBy] = useLocalStorage('sort_by', 'trending');

  const actions = [
    {
      icon: Filter,
      label: 'Filters',
      isActive: showAdvancedFilters,
      onClick: onToggleFilters,
      badge: Object.keys(userPreferences.filters || {}).length > 0 ? 'Active' : null
    },
    {
      icon: Bookmark,
      label: 'Watchlist',
      isActive: showWatchlist,
      onClick: onToggleWatchlist,
      badge: userPreferences.watchlist?.length > 0 ? userPreferences.watchlist.length.toString() : null
    },
    {
      icon: Shuffle,
      label: 'Random',
      onClick: () => {/* Handle random movie */},
      badge: null
    },
    {
      icon: viewMode === 'grid' ? List : Grid,
      label: viewMode === 'grid' ? 'List View' : 'Grid View',
      onClick: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
      badge: null
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-xl"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Button
            variant={action.isActive ? "default" : "outline"}
            size="sm"
            onClick={action.onClick}
            className="relative"
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
            {action.badge && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-4 px-1.5 text-xs"
              >
                {action.badge}
              </Badge>
            )}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};
