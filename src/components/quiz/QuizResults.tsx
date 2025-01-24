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
        // First get the movie_metadata UUID for the TMDB ID
        const { data: movieData, error: movieError } = await supabase
          .from('movie_metadata')
          .select('id')
          .eq('tmdb_id', movie.id)
          .maybeSingle();

        if (movieError || !movieData) {
          console.error('Error fetching movie metadata:', movieError);
          continue;
        }

        // Then use that UUID to get streaming services
        const { data: availabilityData, error } = await supabase
          .from('movie_streaming_availability')
          .select(`
            streaming_services (
              name
            )
          `)
          .eq('movie_id', movieData.id);

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
      transition={{ duration: 0.5 }}
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
              year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre={movie.genre || "Movie"}
              imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg"}
              description={movie.overview || t("movie.noDescription")}
              trailerUrl={movie.trailer_url || ""}
              rating={movie.vote_average || 0}
              tmdbId={movie.id}
              explanations={movie.explanations || []}
              tags={[movie.genre || "Movie"]}
              streamingServices={movieStreamingServices[movie.id] || []}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};