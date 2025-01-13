import { Button } from "@/components/ui/button";
import { Dice6 } from "lucide-react";
import { TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/components/ui/use-toast";

interface RandomMovieButtonProps {
  movies: TMDBMovie[];
  minRating: number;
  selectedGenre?: string;
}

export const RandomMovieButton = ({ movies, minRating, selectedGenre }: RandomMovieButtonProps) => {
  const { toast } = useToast();

  const handleRandomPick = () => {
    const filteredMovies = movies.filter(movie => {
      const rating = movie.vote_average * 10;
      const matchesRating = rating >= minRating;
      const matchesGenre = !selectedGenre || movie.genre_ids.includes(parseInt(selectedGenre));
      return matchesRating && matchesGenre;
    });

    if (filteredMovies.length === 0) {
      toast({
        title: "Nie znaleziono filmów",
        description: "Spróbuj dostosować filtry",
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    const randomMovie = filteredMovies[randomIndex];
    
    toast({
      title: "Losowy wybór filmu",
      description: `${randomMovie.title} (${randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 'N/A'}) - ${Math.round(randomMovie.vote_average * 10)}/100`,
    });
  };

  return (
    <Button 
      onClick={handleRandomPick} 
      variant="outline"
      className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10 hover:from-blue-600/20 hover:via-violet-600/20 hover:to-purple-600/20 border-blue-600/20"
    >
      <Dice6 className="h-4 w-4" />
      <span className="text-sm">Losowy film</span>
    </Button>
  );
};