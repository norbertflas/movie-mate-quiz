
import { useState } from "react";
import { Shuffle, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface RandomMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

const sampleMovies: RandomMovie[] = [
  {
    id: 550,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    vote_average: 8.4,
    release_date: "1999-10-15",
    genre_ids: [18, 53]
  },
  {
    id: 13,
    title: "Forrest Gump",
    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    vote_average: 8.8,
    release_date: "1994-07-06",
    genre_ids: [18, 10749]
  },
  {
    id: 238,
    title: "The Godfather",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    vote_average: 9.2,
    release_date: "1972-03-24",
    genre_ids: [18, 80]
  }
];

export const RandomMovieSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [randomMovie, setRandomMovie] = useState<RandomMovie | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomMovie = async () => {
    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const randomIndex = Math.floor(Math.random() * sampleMovies.length);
    const selectedMovie = sampleMovies[randomIndex];
    
    setRandomMovie(selectedMovie);
    setIsGenerating(false);
    
    toast({
      title: t('randomMovie.success'),
      description: t('randomMovie.successDescription', { title: selectedMovie.title }),
    });
  };

  return (
    <Card className="w-full bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
            <Shuffle className="h-6 w-6 text-orange-600" />
            {t('randomMovie.title')}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('randomMovie.subtitle')}
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center"
        >
          <Button
            onClick={generateRandomMovie}
            disabled={isGenerating}
            size="lg"
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                {t('randomMovie.generating')}
              </>
            ) : randomMovie ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                {t('randomMovie.regenerate')}
              </>
            ) : (
              <>
                <Shuffle className="mr-2 h-5 w-5" />
                {t('randomMovie.generate')}
              </>
            )}
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {randomMovie && (
            <motion.div
              key={randomMovie.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${randomMovie.poster_path}`}
                    alt={randomMovie.title}
                    className="w-24 h-36 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {randomMovie.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{new Date(randomMovie.release_date).getFullYear()}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{randomMovie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {randomMovie.overview}
                  </p>
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {t('movie.drama')}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {t('movie.thriller')}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
