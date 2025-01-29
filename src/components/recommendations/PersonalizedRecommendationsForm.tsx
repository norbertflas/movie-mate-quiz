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
import { searchMovies } from "@/services/tmdb";

export const PersonalizedRecommendationsForm = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedMovies, setSelectedMovies] = useState<TMDBMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: t("errors.searchError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const handleSelectMovie = (movie: TMDBMovie) => {
    if (selectedMovies.length >= 5) {
      toast({
        title: t("errors.tooManyMovies"),
        description: t("errors.maxFiveMovies"),
        variant: "destructive",
      });
      return;
    }
    if (!selectedMovies.find(m => m.id === movie.id)) {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovies(selectedMovies.filter(m => m.id !== movieId));
  };

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

      if (error) {
        console.error("Recommendation error:", error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid response format");
      }
      
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
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("recommendations.selectMovies")}
            </label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("recommendations.searchMovies")}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="button" onClick={handleSearch} disabled={isLoading}>
                {t("search.button")}
              </Button>
            </div>
          </div>

          {selectedMovies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("recommendations.selectedMovies")}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMovies.map((movie) => (
                  <Button
                    key={movie.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveMovie(movie.id)}
                  >
                    {movie.title} ×
                  </Button>
                ))}
              </div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("recommendations.searchResults")}</h3>
              <div className="flex flex-wrap gap-2">
                {searchResults.map((movie) => (
                  <Button
                    key={movie.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectMovie(movie)}
                    disabled={selectedMovies.some(m => m.id === movie.id)}
                  >
                    {movie.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

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