
import { Button } from "@/components/ui/button";
import { Dice6 } from "lucide-react";
import { TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { motion } from "framer-motion";

interface RandomMovieButtonProps {
  movies: TMDBMovie[];
  minRating: number;
  selectedGenre?: string;
}

export const RandomMovieButton = ({ movies, minRating, selectedGenre }: RandomMovieButtonProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleRandomPick = () => {
    const filteredMovies = movies.filter(movie => {
      const rating = movie.vote_average * 10;
      const matchesRating = rating >= minRating;
      const matchesGenre = !selectedGenre || movie.genre_ids.includes(parseInt(selectedGenre));
      return matchesRating && matchesGenre;
    });

    if (filteredMovies.length === 0) {
      toast({
        title: t("errors.noMoviesFound", "No movies found"),
        description: t("errors.adjustFilters", "Try adjusting your filters"),
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    const randomMovie = filteredMovies[randomIndex];
    
    setSelectedMovie(randomMovie);
    setIsOpen(true);
    
    toast({
      title: t("common.randomMovie", "Random Movie Pick"),
      description: `${randomMovie.title} (${randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 'N/A'}) - ${Math.round(randomMovie.vote_average * 10)}/100`,
    });
  };

  return (
    <>
      <Button 
        onClick={handleRandomPick} 
        variant="outline"
        className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10 hover:from-blue-600/20 hover:via-violet-600/20 hover:to-purple-600/20 border-blue-600/20"
      >
        <Dice6 className="h-4 w-4" />
        <span className="text-sm">{t("common.randomMovie", "Random Movie")}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedMovie?.title}</DialogTitle>
            <DialogDescription>
              {selectedMovie?.release_date && (
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedMovie.release_date).getFullYear()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMovie && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <motion.div 
                  className="relative overflow-hidden rounded-lg w-full max-w-xs"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w400${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full text-amber-400 text-sm font-medium">
                    ★ {selectedMovie.vote_average.toFixed(1)}
                  </div>
                </motion.div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {selectedMovie.overview}
              </p>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  {t("common.close", "Close")}
                </Button>
                <Button 
                  onClick={handleRandomPick}
                  className="gap-2"
                >
                  <Dice6 className="h-4 w-4" />
                  {t("common.tryAgain", "Try Again")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
