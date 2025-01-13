import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTrendingMovies } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";

export const TrendingMoviesSection = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const { data: trendingMovies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: getTrendingMovies,
  });

  const { data: streamingServices = [] } = useQuery({
    queryKey: ['streamingServices', i18n.language],
    queryFn: async () => {
      const region = languageToRegion[i18n.language] || 'en';
      return getStreamingServicesByRegion(region);
    },
  });

  if (isLoadingMovies) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <Card className="shadow-xl bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
          {t("trending.weeklyTrending")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingMovies.slice(0, 6).map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre="Film"
              imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
              description={movie.overview}
              trailerUrl=""
              rating={movie.vote_average * 10}
              streamingServices={streamingServices.map(service => service.name)}
              tmdbId={movie.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};