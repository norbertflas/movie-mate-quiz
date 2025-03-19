
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Film, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  searchType: "movies" | "creators";
  setSearchType: (type: "movies" | "creators") => void;
}

export const SearchInput = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  searchType,
  setSearchType,
}: SearchInputProps) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      className="space-y-8 w-full px-4 md:px-0 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="movies" onValueChange={(value) => setSearchType(value as "movies" | "creators")}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6 bg-secondary/50 backdrop-blur-sm">
          <TabsTrigger value="movies" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Film className="h-4 w-4" />
            {t("search.movies")}
          </TabsTrigger>
          <TabsTrigger value="creators" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <User className="h-4 w-4" />
            {t("search.creators")}
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={searchType === "movies" ? t("search.placeholder") : t("search.creatorPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4 rounded-xl border-2 border-border focus:border-primary transition-colors bg-secondary/30 backdrop-blur-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            type="submit" 
            disabled={isSearching} 
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20"
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
      </Tabs>
    </motion.div>
  );
};
