
import { useState, useRef, useEffect } from 'react';
import { Search, Film, User, Calendar, TrendingUp, Clock } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/services/tmdb/search';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

interface SearchCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
}

export const SearchCommandDialog = ({
  open,
  onOpenChange,
  onSubmit,
  placeholder = "Search movies, actors, directors..."
}: SearchCommandDialogProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent_searches', []);

  // Search results query
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchMovies(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  // Quick suggestions
  const quickSuggestions = [
    { label: 'Trending Movies', icon: TrendingUp, action: () => onSubmit('trending') },
    { label: 'Recent Releases', icon: Calendar, action: () => onSubmit('recent') },
    { label: 'Top Rated', icon: Film, action: () => onSubmit('top rated') },
  ];

  // All suggestions (recent + quick + search results)
  const allSuggestions = [
    ...recentSearches.slice(0, 3).map(search => ({
      type: 'recent',
      label: search,
      icon: Clock,
      action: () => handleSubmit(search)
    })),
    ...quickSuggestions.map(suggestion => ({
      type: 'quick',
      ...suggestion
    })),
    ...searchResults.slice(0, 5).map((movie: any) => ({
      type: 'result',
      label: movie.title,
      subtitle: movie.release_date ? new Date(movie.release_date).getFullYear() : '',
      icon: Film,
      action: () => handleSubmit(movie.title)
    }))
  ];

  const handleSubmit = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 10);
    });
    
    onSubmit(searchQuery);
    setQuery('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (allSuggestions[selectedIndex]) {
          allSuggestions[selectedIndex].action();
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="sr-only">Search Movies</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-3 text-base border-0 focus-visible:ring-0 bg-muted/30"
            />
          </div>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {allSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-2"
              >
                {recentSearches.length > 0 && query.length === 0 && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Recent Searches
                    </h3>
                  </div>
                )}
                
                {query.length === 0 && quickSuggestions.length > 0 && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Quick Actions
                    </h3>
                  </div>
                )}
                
                {query.length >= 2 && searchResults.length > 0 && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Search Results
                    </h3>
                  </div>
                )}

                {allSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion.type}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={suggestion.action}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      selectedIndex === index 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <suggestion.icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.label}</div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    {suggestion.type === 'recent' && (
                      <Badge variant="outline" className="text-xs">Recent</Badge>
                    )}
                    {suggestion.type === 'quick' && (
                      <Badge variant="secondary" className="text-xs">Quick</Badge>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && query.length >= 2 && (
            <div className="p-4 text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            </div>
          )}

          {query.length >= 2 && !isLoading && searchResults.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {query.length === 0 && allSuggestions.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Start typing to search for movies...
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>Enter to select</span>
              <span>Esc to close</span>
            </div>
            <span>⌘K to open</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
