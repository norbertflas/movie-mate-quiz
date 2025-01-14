import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTrendingMovies } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const TrendingMoviesSection = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const { data: trendingMovies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['trendingMovies', i18n.language],
    queryFn: async () => {
      const region = languageToRegion[i18n.language] || 'US';
      return getTrendingMovies(region);
    },
  });

  const { data: streamingServices = [] } = useQuery({
    queryKey: ['streamingServices', i18n.language],
    queryFn: async () => {
      const region = languageToRegion[i18n.language] || 'US';
      return getStreamingServicesByRegion(region);
    },
  });

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
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="gradient-text text-2xl">
          {t("trending.weeklyTrending")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingMovies.slice(0, 10).map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                streamingServices={streamingServices.map(service => service.name)}
                tmdbId={movie.id}
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};