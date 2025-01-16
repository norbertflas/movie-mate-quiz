import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTrendingMovies } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const TrendingMoviesSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleMovieClick = useCallback((movieId: number) => {
    setSelectedMovie(movieId);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
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

  const selectedMovieData = trendingMovies.find(movie => movie.id === selectedMovie);

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
            {trendingMovies.slice(0, 10).map((movie) => (
              <motion.div
                key={movie.id}
                className="flex-none w-[300px]"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleMovieClick(movie.id)}
                transition={{ duration: 0.2 }}
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
          </motion.div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{selectedMovieData?.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseDialog}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {selectedMovieData && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <img
                  src={selectedMovieData.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovieData.poster_path}` : '/placeholder.svg'}
                  alt={selectedMovieData.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("movie.overview")}</h3>
                  <p className="text-muted-foreground">{selectedMovieData.overview}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedMovieData.release_date).getFullYear()}
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {(selectedMovieData.vote_average * 10).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};