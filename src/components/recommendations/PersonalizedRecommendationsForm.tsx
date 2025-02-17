
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GenreFilter } from "../filters/GenreFilter";
import { PlatformFilter } from "../filters/PlatformFilter";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface FormData {
  genres: string[];
  platforms: string[];
  includeRated: boolean;
  excludeWatched: boolean;
  minRating: string;
}

export const PersonalizedRecommendationsForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: t('recommendations.personalized'),
      description: t('recommendations.basedOn'),
    });

    console.log('Form submitted:', formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('recommendations.personalized')}</CardTitle>
          <CardDescription>{t('recommendations.basedOn')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
            
            <Button type="submit" className="w-full">
              {t('filters.apply')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
