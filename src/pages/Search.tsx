
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, User, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, searchPeople, type TMDBMovie, type TMDBPerson } from "@/services/tmdb";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PersonalizedRecommendationsForm } from "@/components/recommendations/PersonalizedRecommendationsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorCard } from "@/components/search/CreatorCard";
import { getGenreTranslationKey } from "@/utils/genreTranslation";
import { SearchResults } from "@/components/search/SearchResults";
import { useLocation } from "react-router-dom";
import { SearchInput } from "@/components/search/SearchInput";

const Search = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') as "movies" | "creators" || "movies";

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"movies" | "creators" | "personalized">(
    initialType === "personalized" ? initialType : (initialType as "movies" | "creators" || "movies")
  );
  const [filters, setFilters] = useState<MovieFiltersType>({
    yearRange: [1900, new Date().getFullYear()],
    minRating: 0,
  });
  const [shouldSearch, setShouldSearch] = useState(!!initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (initialQuery) {
      setShouldSearch(true);
    }
  }, [initialQuery]);

  const { data: movies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['searchMovies', query, filters, shouldSearch, searchType],
    queryFn: async () => {
      if (!shouldSearch || searchType !== "movies") return [];
      const results = await searchMovies(query);
      return results;
    },
    enabled: shouldSearch && searchType === "movies",
  });

  const { data: creators = [], isLoading: isLoadingCreators } = useQuery({
    queryKey: ['searchCreators', query, shouldSearch, searchType],
    queryFn: async () => {
      if (!shouldSearch || searchType !== "creators" || !query) return [];
      const results = await searchPeople(query);
      return results;
    },
    enabled: shouldSearch && searchType === "creators",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setShouldSearch(true);
    
    // Update URL with search parameters without reloading page
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('q', query);
    newSearchParams.set('type', searchType);
    
    const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
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
        <SearchInput
          searchQuery={query}
          setSearchQuery={setQuery}
          handleSearch={handleSearch}
          isSearching={isSearching}
          searchType={searchType}
          setSearchType={setSearchType}
        />
        
        <Tabs 
          defaultValue={searchType} 
          value={searchType}
          onValueChange={(val) => setSearchType(val as "movies" | "creators" | "personalized")} 
          className="mt-12"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto mb-8">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              {t("search.movies")}
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("search.creators")}
            </TabsTrigger>
            <TabsTrigger value="personalized">
              {t("recommendations.personalized")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="animate-in fade-in-50 duration-300">
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="w-full lg:w-64 lg:sticky lg:top-24 lg:self-start bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
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
                <SearchResults 
                  searchResults={filteredMovies} 
                  creatorResults={[]}
                  getGenreTranslationKey={getGenreTranslationKey}
                />
              </main>
            </div>
          </TabsContent>

          <TabsContent value="creators" className="animate-in fade-in-50 duration-300">
            <SearchResults 
              searchResults={[]} 
              creatorResults={creators}
              getGenreTranslationKey={getGenreTranslationKey}
            />
          </TabsContent>

          <TabsContent value="personalized" className="animate-in fade-in-50 duration-300">
            <div className="max-w-3xl mx-auto">
              <PersonalizedRecommendationsForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;
