import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { MovieGoogleResults } from "./MovieGoogleResults";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

interface MovieGoogleSearchProps {
  title: string;
}

export const MovieGoogleSearch = ({ title }: MovieGoogleSearchProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleSearch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setIsOpen(true);

    try {
      // For now, we'll use dummy data since we need a backend API to make actual Google searches
      // In a real implementation, this would make an API call to our backend
      const dummyResults = [
        {
          title: `${title} - IMDb`,
          link: `https://www.imdb.com/find?q=${encodeURIComponent(title)}`,
          snippet: `Find information about ${title}, including cast, reviews, and ratings on IMDb, the world's most popular and authoritative source for movie and TV content.`
        },
        {
          title: `${title} - Rotten Tomatoes`,
          link: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title)}`,
          snippet: `Read reviews, watch trailers, and get ratings for ${title} on Rotten Tomatoes, the ultimate movie and TV review aggregator.`
        },
        {
          title: `${title} - Wikipedia`,
          link: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title)}`,
          snippet: `Learn about the plot, production, reception, and cultural impact of ${title} on Wikipedia, the free encyclopedia.`
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResults(dummyResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSearch}
        >
          <Search className="h-4 w-4" />
          {t("movie.searchGoogle")}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Search Results for {title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <MovieGoogleResults results={results} isLoading={isLoading} />
        </div>
      </SheetContent>
    </Sheet>
  );
};