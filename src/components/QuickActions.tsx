
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPopularMovies } from "@/services/tmdb";
import { FilterSheet } from "./actions/FilterSheet";
import { RandomMovieButton } from "./actions/RandomMovieButton";
import { TopRatedButton } from "./actions/TopRatedButton";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Dices, Film } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export const QuickActions = () => {
  const [minRating, setMinRating] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['popularMovies', '', '1'],
    queryFn: getPopularMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleMinRatingChange = useCallback((value: number) => {
    setMinRating(value);
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="p-6 border-blue-200/20 dark:border-blue-800/20 bg-background/70 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <Dices className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">
            {t("common.quickActions", "Quick Actions")}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {t("common.quickActionsDescription", "Find something to watch with these quick tools")}
        </p>

        {isLoading ? (
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            <Skeleton className="h-10 w-full sm:w-40" />
            <Skeleton className="h-10 w-full sm:w-40" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            <FilterSheet
              selectedGenre={selectedGenre}
              setSelectedGenre={handleGenreChange}
              minRating={minRating}
              setMinRating={handleMinRatingChange}
              isOpen={isOpen}
              setIsOpen={handleOpenChange}
            />
            
            <RandomMovieButton 
              movies={movies}
              minRating={minRating}
              selectedGenre={selectedGenre}
            />

            <TopRatedButton movies={movies} />
          </div>
        )}
      </Card>
    </motion.div>
  );
};
