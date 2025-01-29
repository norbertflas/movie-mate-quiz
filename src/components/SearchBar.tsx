import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { useTranslation } from "react-i18next";
import { searchMovies, searchPeople } from "@/services/tmdb";
import type { TMDBMovie, TMDBPerson } from "@/services/tmdb";
import { SearchInput } from "./search/SearchInput";
import { SearchResults } from "./search/SearchResults";
import { motion } from "framer-motion";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [creatorResults, setCreatorResults] = useState<TMDBPerson[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<"movies" | "creators">("movies");
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: t("errors.searchTooShort"),
        description: t("errors.searchMinLength"),
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      if (searchType === "movies") {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
        setCreatorResults([]);
        
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
      } else {
        const people = await searchPeople(searchQuery);
        setCreatorResults(people);
        setSearchResults([]);

        if (people.length > 0) {
          toast({
            title: t("search.creatorsFound"),
            description: t("search.creatorsDescription", { count: people.length, query: searchQuery }),
            className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
          });
        } else {
          toast({
            title: t("search.noCreators"),
            description: t("search.noCreatorsDescription", { query: searchQuery }),
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: t("errors.searchError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getGenreTranslationKey = (genreId: number) => {
    // Map TMDB genre IDs to our translation keys
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
    
    return `movie.${genreMap[genreId] || "unknown"}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isSearching={isSearching}
        searchType={searchType}
        setSearchType={setSearchType}
      />
      
      <SearchResults
        searchResults={searchResults}
        creatorResults={creatorResults}
        getGenreTranslationKey={getGenreTranslationKey}
      />
    </motion.div>
  );
};