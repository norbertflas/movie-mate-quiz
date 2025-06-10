
import { useState } from "react";
import { Search, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DynamicMovieBackground } from "@/components/movie/DynamicMovieBackground";

interface FindYourPerfectMovieProps {
  onStartQuiz: () => void;
}

export const FindYourPerfectMovie = ({ onStartQuiz }: FindYourPerfectMovieProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"movies" | "creators">("movies");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSearching(false);
    
    console.log(`Searching for ${searchType}:`, searchQuery);
  };

  const popularSearches = [
    "Avengers", "The Matrix", "Pulp Fiction", "Inception", "The Godfather"
  ];

  return (
    <DynamicMovieBackground 
      className="min-h-[600px] relative"
      variant="light"
      overlayOpacity={0.95}
      rowCount={4}
      speed="medium"
    >
      <div className="container mx-auto px-4 py-16">
        <Card className="w-full bg-background/50 dark:bg-background/50 backdrop-blur-sm border border-border/30 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                Find Your Perfect Movie
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Search for movies and creators or answer a few questions in our movie quiz
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search Type Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={searchType === "movies" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSearchType("movies")}
                  className="rounded-md px-6"
                >
                  Movies
                </Button>
                <Button
                  variant={searchType === "creators" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSearchType("creators")}
                  className="rounded-md px-6"
                >
                  Creators
                </Button>
              </div>
            </motion.div>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-2 max-w-2xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={
                    searchType === "movies" 
                      ? "Enter movie title..."
                      : "Enter actor, director name..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-lg bg-background/80 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                size="lg"
                className="px-8"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </motion.div>

            {/* Popular Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-3">
                Popular searches:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {/* Quiz Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center space-y-4"
            >
              <Button
                onClick={onStartQuiz}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Movie Quiz
              </Button>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4">
                  <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">Personalized recommendations</h4>
                </div>
                <div className="text-center p-4">
                  <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium text-sm">Service availability</h4>
                </div>
                <div className="text-center p-4">
                  <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Filter className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium text-sm">Smart matching</h4>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </DynamicMovieBackground>
  );
};
