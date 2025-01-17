import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TMDBMovie } from "@/services/tmdb";
import { MovieCard } from "../MovieCard";

export const PersonalizedRecommendationsForm = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedMovies, setSelectedMovies] = useState<TMDBMovie[]>([]);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: t("errors.emptyPrompt"),
        description: t("errors.enterPrompt"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-personalized-recommendations", {
        body: {
          prompt,
          selectedMovies: selectedMovies.map(movie => ({
            id: movie.id,
            title: movie.title,
            genres: movie.genre_ids
          }))
        }
      });

      if (error) throw error;
      setRecommendations(data);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast({
        title: t("errors.recommendationError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              {t("recommendations.promptLabel")}
            </label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("recommendations.promptPlaceholder")}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading || !prompt.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("recommendations.getRecommendations")}
          </Button>
        </form>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {t("recommendations.yourRecommendations")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                platform="TMDB"
                genre={t("movie.genre")}
                imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                description={movie.overview}
                trailerUrl=""
                rating={movie.vote_average * 10}
                tmdbId={movie.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};