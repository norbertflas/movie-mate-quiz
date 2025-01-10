import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { SAMPLE_RECOMMENDATIONS } from "./QuizSection";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const results = SAMPLE_RECOMMENDATIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (results.length > 0) {
      toast({
        title: "Znalezione tytuły",
        description: `Znaleziono ${results.length} tytułów pasujących do zapytania "${searchQuery}"`,
      });
    } else {
      toast({
        title: "Brak wyników",
        description: `Nie znaleziono tytułów pasujących do zapytania "${searchQuery}"`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-8">
      <Input
        type="text"
        placeholder="Szukaj po tytule, aktorze lub reżyserze..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">
        <Search className="mr-2 h-4 w-4" />
        Szukaj
      </Button>
    </form>
  );
};