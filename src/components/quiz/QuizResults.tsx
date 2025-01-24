import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import { Card } from "../ui/card";
import type { QuizResultsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";

export const QuizResults = ({ recommendations, isGroupQuiz = false }: QuizResultsProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [movieStreamingServices, setMovieStreamingServices] = useState<{ [key: number]: string[] }>({});
  const [expandedMovieId, setExpandedMovieId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStreamingServices = async () => {
      for (const movie of recommendations) {
        try {
          // First get the movie_metadata UUID for the TMDB ID
          const { data: movieData, error: movieError } = await supabase
            .from('movie_metadata')
            .select('id')
            .eq('tmdb_id', movie.id)
            .maybeSingle();

          if (movieError) {
            console.error('Error fetching movie metadata:', movieError);
            continue;
          }

          if (!movieData) {
            // If movie doesn't exist in metadata, insert it
            const { data: newMovieData, error: insertError } = await supabase
              .from('movie_metadata')
              .insert({
                tmdb_id: movie.id,
                title: movie.title,
                overview: movie.overview,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
              })
              .select('id')
              .single();

            if (insertError) {
              console.error('Error inserting movie metadata:', insertError);
              continue;
            }

            movieData = newMovieData;
          }

          // Then use that UUID to get streaming services
          const { data: availabilityData, error: availabilityError } = await supabase
            .from('movie_streaming_availability')
            .select(`
              streaming_services (
                name
              )
            `)
            .eq('movie_id', movieData.id);

          if (availabilityError) {
            console.error('Error fetching streaming availability:', availabilityError);
            continue;
          }

          if (availabilityData) {
            const services = availabilityData.map((item: any) => item.streaming_services.name);
            setMovieStreamingServices(prev => ({
              ...prev,
              [movie.id]: services
            }));
          }
        } catch (error) {
          console.error('Error in streaming services fetch:', error);
        }
      }
    };

    if (recommendations.length > 0) {
      fetchStreamingServices();
    }
  }, [recommendations]);

  const handleMovieClose = () => {
    setExpandedMovieId(null);
  };

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
              isExpanded={expandedMovieId === movie.id}
              onClose={handleMovieClose}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};