import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MovieCard } from "@/components/MovieCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export const RecentlyViewedSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: recentMovies, isLoading, error } = useQuery({
    queryKey: ['recentlyViewedMovies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watched_movies')
        .select('*')
        .order('watched_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching watched movies:', error);
        throw error;
      }

      return data || [];
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast({
          title: t('errors.fetchError'),
          description: t('errors.tryAgain'),
          variant: "destructive",
        });
      }
    }
  });

  if (error) return null;
  if (!recentMovies?.length) return null;

  return (
    <Card className="shadow-xl bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
          {t("recently.viewed")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            recentMovies.map((movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MovieCard
                  title={movie.title}
                  year=""
                  platform="TMDB"
                  genre="Film"
                  imageUrl=""
                  description=""
                  trailerUrl=""
                  rating={movie.rating || 0}
                  tmdbId={movie.tmdb_id}
                />
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};