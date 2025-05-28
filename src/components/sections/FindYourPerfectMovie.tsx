
import { motion } from "framer-motion";
import { Sparkles, Search, Film, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface FindYourPerfectMovieProps {
  onStartQuiz: () => void;
}

export const FindYourPerfectMovie = ({ onStartQuiz }: FindYourPerfectMovieProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"movies" | "creators">("movies");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      setIsSearching(false);
    }, 500);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12"
    >
      <Card className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Find your perfect movie
                </h2>
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Wyszukaj filmy i twórców lub odpowiedz na kilka pytań w quizie filmowym
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Search Type Tabs */}
              <Tabs value={searchType} onValueChange={(value) => setSearchType(value as "movies" | "creators")} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="movies" className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    Filmy
                  </TabsTrigger>
                  <TabsTrigger value="creators" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Twórcy
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder={searchType === "movies" 
                      ? "Wpisz tytuł filmu..." 
                      : "Wpisz imię aktora, reżysera..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-background/50 border border-border rounded-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  {isSearching ? "Szukam..." : "Szukaj"}
                </Button>
              </form>
              
              {/* Quick Search Suggestions */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <p className="text-sm text-muted-foreground w-full">Popularne wyszukiwania:</p>
                {searchType === "movies" ? (
                  <>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Action")}
                    >
                      Action
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Comedy")}
                    >
                      Komedia
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Sci-Fi")}
                    >
                      Sci-Fi
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Horror")}
                    >
                      Horror
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Christopher Nolan")}
                    >
                      Christopher Nolan
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Leonardo DiCaprio")}
                    >
                      Leonardo DiCaprio
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Quentin Tarantino")}
                    >
                      Quentin Tarantino
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => handleQuickSearch("Meryl Streep")}
                    >
                      Meryl Streep
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Personalizowane rekomendacje
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                Dostępność w serwisach
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                Inteligentny matching
              </Badge>
            </div>

            {/* Quiz CTA Button */}
            <div className="border-t border-border/50 pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Lub pozwól nam znaleźć idealne filmy dopasowane do Twoich preferencji
              </p>
              <Button 
                size="lg" 
                onClick={onStartQuiz}
                className="group relative px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  <span>Rozpocznij Quiz Filmowy</span>
                </span>
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
};
