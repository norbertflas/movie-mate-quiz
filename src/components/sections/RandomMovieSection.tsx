
import { motion } from "framer-motion";
import { Shuffle, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { discoverMovies } from "@/services/tmdb";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const RandomMovieSection = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [randomMovie, setRandomMovie] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { refetch: fetchRandomMovie } = useQuery({
    queryKey: ['randomMovie'],
    queryFn: async () => {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const movies = await discoverMovies({
        page: randomPage,
        sort_by: 'popularity.desc',
        'vote_count.gte': 100
      });
      const randomIndex = Math.floor(Math.random() * movies.length);
      return movies[randomIndex];
    },
    enabled: false
  });

  const handleGenerateRandomMovie = async () => {
    setIsGenerating(true);
    try {
      const result = await fetchRandomMovie();
      if (result.data) {
        setRandomMovie(result.data);
        toast({
          title: "Losowy film wygenerowany!",
          description: `Znaleźliśmy dla Ciebie: ${result.data.title}`,
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować losowego filmu",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-8"
    >
      <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Shuffle className="h-6 w-6 text-orange-500 animate-bounce" />
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                  Losowy film na dziś
                </h2>
              </div>
              <p className="text-muted-foreground">
                Nie wiesz co obejrzeć? Pozwól nam wybrać coś dla Ciebie!
              </p>
            </div>

            {/* Random Movie Result */}
            {randomMovie && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-background/50 rounded-lg border border-border"
              >
                {randomMovie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${randomMovie.poster_path}`}
                    alt={randomMovie.title}
                    className="w-20 h-30 object-cover rounded-md"
                  />
                )}
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg">{randomMovie.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {randomMovie.overview}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      ⭐ {randomMovie.vote_average?.toFixed(1)}
                    </Badge>
                    <Badge variant="outline">
                      {randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 'N/A'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA Button */}
            <Button 
              size="lg" 
              onClick={handleGenerateRandomMovie}
              disabled={isGenerating}
              className="group relative px-6 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600"
            >
              <span className="flex items-center gap-2">
                <Shuffle className={`h-5 w-5 transition-transform ${isGenerating ? 'animate-spin' : 'group-hover:scale-110'}`} />
                <span>{isGenerating ? 'Generuję...' : randomMovie ? 'Wygeneruj ponownie' : 'Wygeneruj losowy film'}</span>
              </span>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
};
