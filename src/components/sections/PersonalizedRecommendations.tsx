import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { MovieCard } from "@/components/MovieCard";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getPersonalizedRecommendations } from "@/utils/recommendationEngine";
import { getMovieDetails } from "@/services/tmdb";

export const PersonalizedRecommendations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ['personalizedRecommendations'],
    queryFn: async () => {
      const scores = await getPersonalizedRecommendations();
      const movieDetailsPromises = scores.slice(0, 10).map(async (score) => {
        try {
          const movie = await getMovieDetails(score.movieId);
          return {
            ...movie,
            explanations: score.explanations
          };
        } catch (error) {
          console.error('Error fetching movie details:', error);
          return null;
        }
      });

      const movies = await Promise.all(movieDetailsPromises);
      return movies.filter(Boolean);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        toast({
          title: t("errors.recommendationError"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t("errors.recommendationError")}
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="glass-panel p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 gradient-text">
        {t("recommendations.personalized")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((movie: any, index) => (
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
              genre={movie.genres?.[0]?.name || t("movie.genre")}
              imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              description={movie.overview}
              trailerUrl=""
              rating={movie.vote_average * 10}
              tmdbId={movie.id}
              explanations={movie.explanations}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};