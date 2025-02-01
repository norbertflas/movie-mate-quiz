import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, type TMDBMovie } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PersonalizedRecommendationsForm } from "@/components/recommendations/PersonalizedRecommendationsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Search = () => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MovieFiltersType>({
    yearRange: [1900, new Date().getFullYear()],
    minRating: 0,
  });
  const [shouldSearch, setShouldSearch] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['searchMovies', query, filters, shouldSearch],
    queryFn: async () => {
      if (!shouldSearch) return [];
      const results = await searchMovies(query);
      return results;
    },
    enabled: shouldSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShouldSearch(true);
  };

  const handleFilterChange = (newFilters: MovieFiltersType) => {
    setFilters(newFilters);
  };

  const filteredMovies = movies.filter(movie => {
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
    const rating = movie.vote_average * 10; // Convert to percentage

    const matchesYear = year >= filters.yearRange[0] && year <= filters.yearRange[1];
    const matchesRating = rating >= filters.minRating;
    const matchesGenre = !filters.genre || movie.genre_ids?.includes(parseInt(filters.genre));
    const matchesTags = !filters.tags?.length || true; // TODO: Implement tag filtering when available

    return matchesYear && matchesRating && matchesGenre && matchesTags;
  });

  const handleFilterSearch = () => {
    setShouldSearch(true);
    
    // Show appropriate toast based on results
    if (filteredMovies.length === 0) {
      toast({
        title: t("search.noResults"),
        description: t("search.tryDifferentFilters"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("search.resultsFound"),
        description: t("search.filteredResults", { count: filteredMovies.length }),
        className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background/40">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">{t("search.movies")}</TabsTrigger>
            <TabsTrigger value="personalized">{t("recommendations.personalized")}</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="w-full lg:w-64">
                <MovieFilters onFilterChange={handleFilterChange} />
                <Button 
                  onClick={handleFilterSearch}
                  className="w-full mt-4"
                  variant="secondary"
                >
                  <SearchIcon className="mr-2 h-4 w-4" />
                  {t("filters.applySearch")}
                </Button>
              </aside>
              
              <main className="flex-1 space-y-6">
                <form className="flex gap-2" onSubmit={handleSearch}>
                  <Input
                    type="text"
                    placeholder={t("search.placeholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <SearchIcon className="mr-2 h-4 w-4" />
                    {t("search.button")}
                  </Button>
                </form>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        title={movie.title}
                        year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                        platform="TMDB"
                        genre={t(`movie.${movie.genre_ids?.[0] || 'unknown'}`)}
                        imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        description={movie.overview}
                        trailerUrl=""
                        rating={movie.vote_average * 10}
                        tmdbId={movie.id}
                      />
                    ))}
                  </motion.div>
                )}
              </main>
            </div>
          </TabsContent>

          <TabsContent value="personalized">
            <PersonalizedRecommendationsForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;