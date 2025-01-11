import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { SAMPLE_RECOMMENDATIONS } from "./quiz/QuizConstants";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof SAMPLE_RECOMMENDATIONS>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = SAMPLE_RECOMMENDATIONS.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setSuggestions(results);
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const results = SAMPLE_RECOMMENDATIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
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
      <div className="relative flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              type="text"
              placeholder="Szukaj po tytule, gatunku, tagach lub opisie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>Brak wyników</CommandEmpty>
                <CommandGroup heading="Sugestie">
                  {suggestions.map((item) => (
                    <CommandItem
                      key={item.title}
                      onSelect={() => {
                        setSearchQuery(item.title);
                        setOpen(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.genre} • {item.year} • {item.platform}
                        </span>
                        {item.tags && (
                          <span className="text-sm text-muted-foreground">
                            {item.tags.join(" • ")}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button type="submit">
        <Search className="mr-2 h-4 w-4" />
        Szukaj
      </Button>
    </form>
  );
};