import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, type TMDBMovie } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['searchMovies', query, filters],
    queryFn: () => searchMovies(query),
    enabled: true, // Allow searching without query
  });

  const filteredMovies = movies.filter(movie => {
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
    const rating = movie.vote_average;

    const matchesYear = year >= filters.yearRange[0] && year <= filters.yearRange[1];
    const matchesRating = (rating * 10) >= filters.minRating;
    const matchesPlatform = !filters.platform || true; // We'll handle platform filtering later
    const matchesGenre = !filters.genre || movie.genre_ids.includes(parseInt(filters.genre));

    return matchesYear && matchesRating && matchesPlatform && matchesGenre;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background/40">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">{t("navigation.search")}</TabsTrigger>
            <TabsTrigger value="personalized">{t("recommendations.personalized")}</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="w-full lg:w-64">
                <MovieFilters onFilterChange={setFilters} />
              </aside>
              
              <main className="flex-1 space-y-6">
                <form onSubmit={handleSearch} className="flex gap-2">
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        title={movie.title}
                        year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                        platform="TMDB"
                        genre={t("movie.genre")}
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