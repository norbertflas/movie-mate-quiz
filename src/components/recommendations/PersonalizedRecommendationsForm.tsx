
import { useState } from "react";
import { MovieCard } from "../MovieCard";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { motion } from "framer-motion";
import type { TMDBMovie } from "@/services/tmdb";

export const PersonalizedRecommendationsForm = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('get-ai-recommendations', {
        body: { 
          prompt,
          filters: {},
          language: i18n.language // Pass current language
        }
      });

      if (error) throw error;

      if (data.recommendations) {
        setRecommendations(data.recommendations.map((rec: any) => ({
          ...rec,
          explanations: rec.reason ? [rec.reason] : []
        })));
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: t("errors.recommendationError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={t("recommendations.promptPlaceholder")}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <Button 
          type="submit" 
          disabled={loading || !prompt.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.loading")}
            </>
          ) : (
            t("recommendations.submit")
          )}
        </Button>
      </form>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {recommendations.map((movie, index) => (
            <motion.div
              key={movie.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MovieCard
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                platform="TMDB"
                genre={movie.genres?.[0]?.name || t("movie.genre")}
                imageUrl={movie.poster_path || "/placeholder.svg"}
                description={movie.overview || ""}
                trailerUrl=""
                rating={movie.vote_average * 10}
                tmdbId={movie.id}
                explanations={movie.explanations}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
