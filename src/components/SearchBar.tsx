import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { MovieCard } from "./MovieCard";
import { searchMovies } from "@/services/tmdb";
import type { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
      
      if (results.length > 0) {
        toast({
          title: t("search.resultsFound"),
          description: t("search.resultsDescription", { count: results.length, query: searchQuery }),
          className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
        });
      } else {
        toast({
          title: t("search.noResults"),
          description: t("search.noResultsDescription", { query: searchQuery }),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: t("search.error"),
        description: t("search.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getGenreTranslationKey = (genreId: number): string => {
    // Map TMDB genre IDs to translation keys
    const genreMap: Record<number, string> = {
      28: "action",
      12: "adventure",
      16: "animation",
      35: "comedy",
      80: "crime",
      99: "documentary",
      18: "drama",
      10751: "family",
      14: "fantasy",
      36: "history",
      27: "horror",
      10402: "music",
      9648: "mystery",
      10749: "romance",
      878: "sciFi",
      10770: "tvMovie",
      53: "thriller",
      10752: "war",
      37: "western"
    };
    return genreMap[genreId] || "other";
  };

  return (
    <div className="space-y-8 w-full px-4 md:px-0 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            type="submit" 
            disabled={isSearching} 
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                {t("search.button")}
              </>
            )}
          </Button>
        </form>
      </motion.div>

      <AnimatePresence mode="wait">
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {searchResults.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MovieCard
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                  platform="TMDB"
                  genre={t(`movie.${getGenreTranslationKey(movie.genre_ids?.[0] || 0)}`)}
                  imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  description={movie.overview}
                  trailerUrl={`https://www.youtube.com/watch?v=${movie.video_id || ''}`}
                  rating={movie.vote_average}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};