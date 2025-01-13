import { Button } from "./ui/button";
import { Dice6, Filter, Star } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { useTranslation } from "react-i18next";
import { MOVIE_CATEGORIES } from "./quiz/QuizConstants";
import { getPopularMovies } from "@/services/tmdb";
import { useQuery } from "@tanstack/react-query";

export const QuickActions = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [minRating, setMinRating] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

  const { data: movies = [] } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

  const handleRandomPick = () => {
    const filteredMovies = movies.filter(movie => {
      const rating = movie.vote_average * 10;
      const matchesRating = rating >= minRating;
      const matchesGenre = !selectedGenre || movie.genre_ids.includes(parseInt(selectedGenre));
      return matchesRating && matchesGenre;
    });

    if (filteredMovies.length === 0) {
      toast({
        title: t("recommendations.noMoviesFound"),
        description: t("recommendations.tryDifferentFilters"),
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    const randomMovie = filteredMovies[randomIndex];
    
    toast({
      title: t("recommendations.randomPick"),
      description: `${randomMovie.title} (${randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 'N/A'}) - ${Math.round(randomMovie.vote_average * 10)}/100`,
    });
  };

  return (
    <div className="flex justify-center gap-4 mb-8">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            {t("recommendations.filters")}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>{t("recommendations.filterSettings")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>{t("filters.genre")}</Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.selectGenre")} />
                </SelectTrigger>
                <SelectContent>
                  {MOVIE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {t(`movie.${category.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>{t("filters.minRating")}</Label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[minRating]}
                onValueChange={(value) => setMinRating(value[0])}
              />
              <div className="text-sm text-muted-foreground">
                {minRating}/100
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <Button onClick={handleRandomPick} variant="outline" className="gap-2">
        <Dice6 className="h-4 w-4" />
        {t("recommendations.randomMovie")}
      </Button>

      <Button variant="outline" className="gap-2" onClick={() => {
        const topRatedMovies = [...movies]
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 5);

        toast({
          title: t("recommendations.topRated"),
          description: topRatedMovies
            .map(movie => `${movie.title} (${Math.round(movie.vote_average * 10)}/100)`)
            .join('\n'),
        });
      }}>
        <Star className="h-4 w-4" />
        {t("recommendations.topRated")}
      </Button>
    </div>
  );
};