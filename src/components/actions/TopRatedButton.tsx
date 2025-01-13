import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/components/ui/use-toast";

interface TopRatedButtonProps {
  movies: TMDBMovie[];
}

export const TopRatedButton = ({ movies }: TopRatedButtonProps) => {
  const { toast } = useToast();

  const handleShowTopRated = () => {
    const topRatedMovies = [...movies]
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 5);

    toast({
      title: "Najwyżej oceniane filmy",
      description: topRatedMovies
        .map(movie => `${movie.title} (${Math.round(movie.vote_average * 10)}/100)`)
        .join('\n'),
    });
  };

  return (
    <Button 
      variant="outline" 
      className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10 hover:from-blue-600/20 hover:via-violet-600/20 hover:to-purple-600/20 border-blue-600/20"
      onClick={handleShowTopRated}
    >
      <Star className="h-4 w-4" />
      <span className="text-sm">Najwyżej oceniane</span>
    </Button>
  );
};