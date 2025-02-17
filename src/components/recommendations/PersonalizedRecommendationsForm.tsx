
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
import { VOD_SERVICES } from "@/components/quiz/constants/streamingServices";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

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
          filters: {
            platforms: VOD_SERVICES
          },
          language: i18n.language
        }
      });

      if (error) throw error;

      if (data.recommendations) {
        setRecommendations(data.recommendations.map((rec: any) => ({
          ...rec,
          explanations: rec.reason ? [rec.reason] : []
        })));

        toast({
          title: t("recommendations.success"),
          description: t("recommendations.aiGenerated"),
          className: "bg-green-500 text-white"
        });
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
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <Card className="p-6 bg-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("recommendations.personalized")}</h2>
            <p className="text-muted-foreground">
              {t("recommendations.prompt")}
            </p>
          </div>
          
          <Textarea
            placeholder={t("recommendations.promptPlaceholder")}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("streaming.availableOn", "Available on")}</h3>
            <div className="flex flex-wrap gap-2">
              {VOD_SERVICES.map((service) => (
                <Badge key={service} variant="secondary">
                  <Check className="w-3 h-3 mr-1" />
                  {service}
                </Badge>
              ))}
            </div>
          </div>

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
              t("recommendations.submit", "Get Recommendations")
            )}
          </Button>
        </form>
      </Card>

      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <Separator />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("recommendations.forYou")}</h2>
            <p className="text-muted-foreground">{t("recommendations.basedOn")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  streamingServices={VOD_SERVICES}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
