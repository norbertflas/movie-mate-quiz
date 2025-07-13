
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LoadingState } from "@/components/LoadingState";
import { TrendingMoviesSection } from "./TrendingMoviesSection";
import { PopularMoviesSection } from "./PopularMoviesSection";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface MainContentProps {
  trendingMovies: any[];
  popularMovies: any[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  userPreferences?: any;
  currentView: 'welcome' | 'quiz' | 'explore';
}

export const MainContent = ({
  trendingMovies,
  popularMovies,
  isLoading,
  hasError,
  onRetry,
  userPreferences,
  currentView
}: MainContentProps) => {
  if (isLoading) {
    return <LoadingState message="Loading movies..." />;
  }

  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground mb-4">Failed to load movies</p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <TrendingMoviesSection movies={trendingMovies} />
      <PopularMoviesSection movies={popularMovies} />
    </div>
  );
};
