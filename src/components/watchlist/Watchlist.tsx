
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WatchlistProps {
  userPreferences?: any;
  onUpdate?: (preferences: any) => void;
}

const Watchlist = ({ userPreferences, onUpdate }: WatchlistProps) => {
  const watchlist = userPreferences?.watchlist || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            My Watchlist
          </h3>
          {watchlist.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onUpdate?.({ ...userPreferences, watchlist: [] })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        
        {watchlist.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Your watchlist is empty. Add some movies to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {watchlist.map((movie: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span>{movie.title || `Movie ${index + 1}`}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const newWatchlist = watchlist.filter((_: any, i: number) => i !== index);
                    onUpdate?.({ ...userPreferences, watchlist: newWatchlist });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default Watchlist;
