import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTrendingMovies } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { MovieDetailsDialog } from "../movie/MovieDetailsDialog";

export const TrendingMoviesSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const { data: trendingMovies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['trendingMovies', ''],
    queryFn: getTrendingMovies,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: t("errors.recommendationError"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
      }
    }
  });

  const handleMovieClick = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setIsDialogOpen(true);
    document.body.classList.add('dialog-open');
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
    document.body.classList.remove('dialog-open');
  }, []);

  if (isLoadingMovies) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="gradient-text text-2xl">
            {t("trending.weeklyTrending")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel overflow-hidden relative">
      <CardHeader>
        <CardTitle className="gradient-text text-2xl">
          {t("trending.weeklyTrending")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="relative"
          onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
          onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <motion.div 
            className="flex space-x-6 py-4 overflow-x-auto scrollbar-hide group no-select"
            initial={{ x: 0 }}
            animate={{ 
              x: isHovered ? 0 : [-1000, 0]
            }}
            transition={{ 
              duration: 30,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
          >
            <AnimatePresence>
              {trendingMovies.slice(0, 10).map((movie) => (
                <motion.div
                  key={movie.id}
                  className="flex-none w-[300px]"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleMovieClick(movie)}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <MovieCard
                    title={movie.title}
                    year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                    platform="TMDB"
                    genre={t("movie.genre")}
                    imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                    description={movie.overview}
                    trailerUrl=""
                    rating={movie.vote_average * 10}
                    tmdbId={movie.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </CardContent>

      <MovieDetailsDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        movie={selectedMovie}
      />
    </Card>
  );
};