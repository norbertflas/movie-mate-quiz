
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, searchPeople, type TMDBMovie, type TMDBPerson } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PersonalizedRecommendationsForm } from "@/components/recommendations/PersonalizedRecommendationsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorCard } from "@/components/search/CreatorCard";
import { getGenreTranslationKey } from "@/utils/genreTranslation";
import { SearchResults } from "@/components/search/SearchResults";

const Search = () => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MovieFiltersType>({
    yearRange: [1900, new Date().getFullYear()],
    minRating: 0,
  });
  const [shouldSearch, setShouldSearch] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: movies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['searchMovies', query, filters, shouldSearch],
    queryFn: async () => {
      if (!shouldSearch) return [];
      const results = await searchMovies(query);
      return results;
    },
    enabled: shouldSearch,
  });

  const { data: creators = [], isLoading: isLoadingCreators } = useQuery({
    queryKey: ['searchCreators', query, shouldSearch],
    queryFn: async () => {
      if (!shouldSearch || !query) return [];
      const results = await searchPeople(query);
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
    const rating = movie.vote_average * 10;

    const matchesYear = year >= filters.yearRange[0] && year <= filters.yearRange[1];
    const matchesRating = rating >= filters.minRating;
    const matchesGenre = !filters.genre || movie.genre_ids?.includes(parseInt(filters.genre));
    const matchesTags = !filters.tags?.length || true;

    return matchesYear && matchesRating && matchesGenre && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background/40">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movies">{t("search.movies")}</TabsTrigger>
            <TabsTrigger value="creators">{t("search.creators")}</TabsTrigger>
            <TabsTrigger value="personalized">{t("recommendations.personalized")}</TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="w-full lg:w-64">
                <MovieFilters onFilterChange={handleFilterChange} />
                <Button 
                  onClick={() => setShouldSearch(true)}
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

                <SearchResults 
                  searchResults={filteredMovies} 
                  creatorResults={[]}
                  getGenreTranslationKey={getGenreTranslationKey}
                />
              </main>
            </div>
          </TabsContent>

          <TabsContent value="creators">
            <div className="space-y-6">
              <form className="flex gap-2" onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder={t("search.creatorPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  {t("search.button")}
                </Button>
              </form>

              <SearchResults 
                searchResults={[]} 
                creatorResults={creators}
                getGenreTranslationKey={getGenreTranslationKey}
              />
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
