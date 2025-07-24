
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, User, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, searchPeople, type TMDBMovie, type TMDBPerson } from "@/services/tmdb";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { PersonalizedRecommendationsForm } from "@/components/recommendations/PersonalizedRecommendationsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGenreTranslationKey } from "@/utils/genreTranslation";
import { SmartSearchResults } from "@/components/search/SmartSearchResults";
import { useLocation } from "react-router-dom";
import { SearchInput } from "@/components/search/SearchInput";
import StreamingServiceFilter from "@/components/streaming/StreamingServiceFilter";

type SearchType = "movies" | "creators" | "personalized";

const Search = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') as SearchType || "movies";

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filters, setFilters] = useState<MovieFiltersType>({
    yearRange: [1900, new Date().getFullYear()],
    minRating: 0,
  });
  const [shouldSearch, setShouldSearch] = useState(!!initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialQuery) {
      setShouldSearch(true);
    }
  }, [initialQuery]);

  // Get movies from TMDB
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

  // Filter movies based on other criteria
  const filteredMovies = useMemo(() => {
    let filtered = [...movies];

    // Apply existing filters
    const year = (movie: TMDBMovie) => movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
    const rating = (movie: TMDBMovie) => movie.vote_average * 10;

    filtered = filtered.filter(movie => {
      const movieYear = year(movie);
      const movieRating = rating(movie);

      const matchesYear = movieYear >= filters.yearRange[0] && movieYear <= filters.yearRange[1];
      const matchesRating = movieRating >= filters.minRating;
      const matchesGenre = !filters.genre || movie.genre_ids?.includes(parseInt(filters.genre));
      const matchesTags = !filters.tags?.length || true;

      return matchesYear && matchesRating && matchesGenre && matchesTags;
    });

    return filtered;
  }, [movies, filters]);

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
          onValueChange={(val) => setSearchType(val as SearchType)} 
          className="mt-12"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="movies" className="flex items-center gap-2 text-sm">
              <Film className="h-4 w-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="personalized" className="flex items-center gap-2 text-xs px-2 py-1">
              <SearchIcon className="h-3 w-3" />
              <span className="whitespace-nowrap">
                Movie Quiz
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="animate-in fade-in-50 duration-300">
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="w-full lg:w-64 lg:sticky lg:top-24 lg:self-start bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                <MovieFilters onFilterChange={handleFilterChange} />
                
                {/* Streaming Service Filter for instant filtering */}
                <div className="mt-6 pt-6 border-t">
                  <StreamingServiceFilter
                    country="pl"
                    selectedServices={selectedServices}
                    onServicesChange={setSelectedServices}
                    availableServices={[]}
                  />
                </div>

                <Button 
                  onClick={() => setShouldSearch(true)}
                  className="w-full mt-4"
                  variant="secondary"
                >
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </aside>
              
              <main className="flex-1 space-y-6">
                <SmartSearchResults
                  searchResults={filteredMovies}
                  creatorResults={[]}
                  getGenreTranslationKey={getGenreTranslationKey}
                  selectedServices={selectedServices}
                  mode="instant"
                  country="pl"
                />
              </main>
            </div>
          </TabsContent>

          <TabsContent value="creators" className="animate-in fade-in-50 duration-300">
            <SmartSearchResults
              searchResults={[]}
              creatorResults={creators}
              getGenreTranslationKey={getGenreTranslationKey}
              selectedServices={[]}
              mode="instant"
              country="us"
            />
          </TabsContent>

          <TabsContent value="personalized" className="animate-in fade-in-50 duration-300">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Movie Quiz
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                  Answer a few questions to get personalized movie recommendations
                </p>
                <PersonalizedRecommendationsForm />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;
