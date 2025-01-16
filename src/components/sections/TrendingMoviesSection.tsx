import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTrendingMovies } from "@/services/tmdb";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { MovieDetailsDialog } from "../movie/MovieDetailsDialog";
import { TrendingMoviesContainer } from "../movie/TrendingMoviesContainer";
import type { TMDBMovie } from "@/services/tmdb";

export const TrendingMoviesSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
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

  const handleMovieClick = useCallback((movie: TMDBMovie) => {
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
          <TrendingMoviesContainer 
            movies={trendingMovies}
            onMovieClick={handleMovieClick}
            isHovered={isHovered}
          />
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