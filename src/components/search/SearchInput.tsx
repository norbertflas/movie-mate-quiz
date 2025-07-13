
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Film, User, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

type SearchType = "movies" | "creators" | "personalized";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
}

export const SearchInput = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  searchType,
  setSearchType,
}: SearchInputProps) => {

  const getPlaceholder = () => {
    switch (searchType) {
      case "movies":
        return "Search for movies...";
      case "creators":
        return "Search for actors, directors...";
      case "personalized":
        return "Take our quiz for personalized movie recommendations";
      default:
        return "Search for movies...";
    }
  };

  return (
    <motion.div 
      className="space-y-8 w-full px-4 md:px-0 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-xl border-2 border-border focus:border-primary transition-colors bg-secondary/30 backdrop-blur-sm"
            disabled={searchType === "personalized"}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Button 
          type="submit" 
          disabled={isSearching || (searchType !== "personalized" && !searchQuery.trim())} 
          className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20"
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              <span className="whitespace-nowrap">Search</span>
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};
