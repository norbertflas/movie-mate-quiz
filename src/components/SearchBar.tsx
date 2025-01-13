import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { MovieCard } from "./MovieCard";
import { searchMovies } from "@/services/tmdb";
import type { TMDBMovie } from "@/services/tmdb";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
      
      if (results.length > 0) {
        toast({
          title: "Znalezione tytuły",
          description: `Znaleziono ${results.length} tytułów pasujących do zapytania "${searchQuery}"`,
        });
      } else {
        toast({
          title: "Brak wyników",
          description: `Nie znaleziono tytułów pasujących do zapytania "${searchQuery}"`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Błąd wyszukiwania",
        description: "Wystąpił problem podczas wyszukiwania. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
        <Input
          type="text"
          placeholder="Szukaj filmów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching}>
          <Search className="mr-2 h-4 w-4" />
          {isSearching ? "Szukam..." : "Szukaj"}
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre={movie.genre_ids?.length ? movie.genre_ids[0].toString() : "Film"}
              imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              description={movie.overview}
              trailerUrl={`https://www.youtube.com/watch?v=${movie.video_id || ''}`}
              rating={movie.vote_average}
            />
          ))}
        </div>
      )}
    </div>
  );
};