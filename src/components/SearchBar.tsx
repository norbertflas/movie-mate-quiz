
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsSearching(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative flex items-center">
        <Input 
          type="text"
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input w-full py-6 pl-12 pr-4 text-base md:text-lg rounded-full shadow-lg focus:ring-2 focus:ring-primary/20 transition-all duration-300"
        />
        <div className="absolute left-4 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <motion.div 
          className="absolute right-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            type="submit" 
            disabled={isSearching || !query.trim()} 
            className="btn-gradient rounded-full h-10 px-6"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("search.button")
            )}
          </Button>
        </motion.div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
        <span>{t("search.trySearching")}:</span>
        {["Action", "Comedy", "Drama", "Sci-Fi"].map((genre) => (
          <motion.button
            key={genre}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setQuery(genre)}
            className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            {genre}
          </motion.button>
        ))}
      </div>
    </form>
  );
};
