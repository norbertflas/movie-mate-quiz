
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
import { CreatorCard } from "@/components/search/CreatorCard";
import { getGenreTranslationKey } from "@/utils/genreTranslation";
import { SearchResults } from "@/components/search/SearchResults";
import { useLocation } from "react-router-dom";
import { SearchInput } from "@/components/search/SearchInput";
import { useSmartStreamingSearch } from "@/hooks/use-smart-streaming-search";
import { StreamingServiceSelector } from "@/components/streaming/StreamingServiceSelector";

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

  // Smart streaming search for instant mode
  const streamingSearch = useSmartStreamingSearch(
    movies.map(m => m.id),
    {
      mode: 'instant', // Instant mode for search page
      selectedServices,
      country: 'us',
      enabled: shouldSearch && searchType === "movies" && movies.length > 0,
      autoFetch: true
    }
  );

  // Filter movies based on streaming availability and other criteria
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

    // Filter by selected streaming services
    if (selectedServices.length > 0) {
      filtered = filtered.filter(movie => {
        const streamingData = streamingSearch.getStreamingData(movie.id);
        if (!streamingData) return false;
        
        return selectedServices.some(serviceId => 
          streamingData.availableServices.some(available => 
            available.toLowerCase().includes(serviceId) ||
            serviceId.toLowerCase().includes(available.toLowerCase())
          )
        );
      });
    }

    return filtered;
  }, [movies, filters, selectedServices, streamingSearch]);

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
                
                {/* Streaming Service Selector for instant filtering */}
                <div className="mt-6 pt-6 border-t">
                  <StreamingServiceSelector
                    selectedServices={selectedServices}
                    onServicesChange={setSelectedServices}
                    country='us'
                    showLabel={true}
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
                {/* Streaming Stats */}
                {shouldSearch && streamingSearch.stats.total > 0 && (
                  <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Found: {filteredMovies.length} movies
                        {streamingSearch.stats.withStreaming > 0 && (
                          <span className="text-green-600 font-medium">
                            • {streamingSearch.stats.withStreaming} available for streaming
                          </span>
                        )}
                      </div>
                      {streamingSearch.loading && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                          <span className="text-sm">Checking streaming availability...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <SearchResults 
                  searchResults={filteredMovies} 
                  creatorResults={[]}
                  getGenreTranslationKey={getGenreTranslationKey}
                  streamingSearch={streamingSearch} // Pass streaming search to results
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
