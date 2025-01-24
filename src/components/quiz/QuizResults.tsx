import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import { Card } from "../ui/card";
import type { QuizResultsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export const QuizResults = ({ recommendations, isGroupQuiz = false }: QuizResultsProps) => {
  const { t } = useTranslation();
  const [movieStreamingServices, setMovieStreamingServices] = useState<{ [key: number]: string[] }>({});

  useEffect(() => {
    const fetchStreamingServices = async () => {
      for (const movie of recommendations) {
        const { data: availabilityData, error } = await supabase
          .from('movie_streaming_availability')
          .select(`
            streaming_services (
              name
            )
          `)
          .eq('movie_id', movie.id);

        if (!error && availabilityData) {
          const services = availabilityData.map((item: any) => item.streaming_services.name);
          setMovieStreamingServices(prev => ({
            ...prev,
            [movie.id]: services
          }));
        }
      }
    };

    if (recommendations.length > 0) {
      fetchStreamingServices();
    }
  }, [recommendations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        {isGroupQuiz ? t("quiz.groupRecommendations") : t("quiz.yourRecommendations")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((movie) => (
          <div key={movie.id} className="space-y-4">
            <MovieCard
              title={movie.title}
              year={movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre={movie.genre || "Movie"}
              imageUrl={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder.svg"}
              description={movie.overview || t("movie.noDescription")}
              trailerUrl={movie.trailerUrl || ""}
              rating={movie.voteAverage || 0}
              tmdbId={movie.id}
              explanations={movie.explanations || []}
              tags={[movie.genre || "Movie"]}
              streamingServices={movieStreamingServices[movie.id] || []}
            />
            {movie.explanations && movie.explanations.length > 0 && (
              <Card className="p-4 bg-muted/50 backdrop-blur">
                <h3 className="font-medium mb-2 text-sm">{t("quiz.whyRecommended")}</h3>
                <ul className="list-disc list-inside space-y-1">
                  {movie.explanations.map((explanation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {explanation}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};