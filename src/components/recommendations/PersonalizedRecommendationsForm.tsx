
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { GenreFilter } from "../filters/GenreFilter";
import { PlatformFilter } from "../filters/PlatformFilter";
import { MovieCard } from "../MovieCard";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface FormData {
  prompt: string;
  genres: string[];
  platforms: string[];
  includeRated: boolean;
  excludeWatched: boolean;
  minRating: string;
}

interface AIRecommendation {
  title: string;
  reason: string;
}

export const PersonalizedRecommendationsForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    prompt: "",
    genres: [],
    platforms: [],
    includeRated: false,
    excludeWatched: true,
    minRating: "7.0"
  });

  const handleGenreChange = (selected: string[]) => {
    setFormData(prev => ({ ...prev, genres: selected }));
  };

  const handlePlatformChange = (selected: string[]) => {
    setFormData(prev => ({ ...prev, platforms: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-recommendations', {
        body: { 
          prompt: formData.prompt,
          filters: {
            genres: formData.genres,
            platforms: formData.platforms,
            minRating: parseFloat(formData.minRating),
            includeRated: formData.includeRated,
            excludeWatched: formData.excludeWatched
          }
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      
      toast({
        title: t('recommendations.success'),
        description: t('recommendations.aiGenerated'),
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: t('errors.recommendationError'),
        description: t('errors.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4"
    >
      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>{t('recommendations.personalized')}</CardTitle>
          <CardDescription>{t('recommendations.basedOn')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">{t('recommendations.prompt')}</Label>
                <Textarea
                  id="prompt"
                  placeholder={t('recommendations.promptPlaceholder')}
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <GenreFilter 
                selectedGenres={formData.genres}
                onGenreChange={handleGenreChange}
              />
              
              <PlatformFilter
                selectedPlatforms={formData.platforms}
                onPlatformChange={handlePlatformChange}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minRating">{t('movie.rating')}</Label>
                  <Input
                    id="minRating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.minRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, minRating: e.target.value }))}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeRated"
                    checked={formData.includeRated}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeRated: checked }))}
                  />
                  <Label htmlFor="includeRated">{t('filters.includeRated')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="excludeWatched"
                    checked={formData.excludeWatched}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, excludeWatched: checked }))}
                  />
                  <Label htmlFor="excludeWatched">{t('filters.excludeWatched')}</Label>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('filters.apply')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          {recommendations.map((rec, index) => (
            <MovieCard
              key={index}
              title={rec.title}
              description={rec.reason}
              platform="AI Recommended"
              imageUrl="/placeholder.svg"
              trailerUrl=""
              rating={0}
              year=""
              genre=""
              explanations={[rec.reason]}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
