import { useEffect, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { getSavedMovies } from "@/services/user";
import { useToast } from "@/components/ui/use-toast";

const Favorites = () => {
  const [movies, setMovies] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadSavedMovies = async () => {
      try {
        const savedMovies = await getSavedMovies();
        setMovies(savedMovies);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Błąd",
          description: "Nie udało się załadować ulubionych filmów",
        });
      }
    };

    loadSavedMovies();
  }, [toast]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ulubione filmy</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie: any) => (
          <MovieCard key={movie.tmdb_id} {...movie} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;