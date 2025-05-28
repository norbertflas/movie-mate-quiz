
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
      <Card className="bg-gradient-to-br from-slate-800/90 via-slate-700/90 to-slate-600/90 border-slate-600/30">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            {/* Header with new styling to match screenshot */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
                    ⭐ {t("findPerfect.title")} ⭐
                  </span>
                </h2>
                <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {t("findPerfect.subtitle")}
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Search Type Tabs */}
              <Tabs value={searchType} onValueChange={(value) => setSearchType(value as "movies" | "creators")} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-700/50 border-slate-600">
                  <TabsTrigger value="movies" className="flex items-center gap-2 text-white data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                    <Film className="h-4 w-4" />
                    {t("findPerfect.searchMovies")}
                  </TabsTrigger>
                  <TabsTrigger value="creators" className="flex items-center gap-2 text-white data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                    <User className="h-4 w-4" />
                    {t("findPerfect.searchCreators")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder={searchType === "movies" 
                      ? t("findPerfect.searchPlaceholder")
                      : t("findPerfect.creatorsPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-gray-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  {isSearching ? t("findPerfect.searching") : t("findPerfect.searchButton")}
                </Button>
              </form>
              
              {/* Quick Search Suggestions */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <p className="text-sm text-gray-400 w-full">{t("findPerfect.popularSearches")}</p>
                {searchType === "movies" ? (
                  <>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
                      onClick={() => handleQuickSearch("Action")}
                    >
                      {t("movie.action")}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
                      onClick={() => handleQuickSearch("Comedy")}
                    >
                      {t("movie.comedy")}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
                      onClick={() => handleQuickSearch("Sci-Fi")}
                    >
                      {t("movie.sciFi")}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
                      onClick={() => handleQuickSearch("Horror")}
                    >
                      {t("movie.horror")}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
                      onClick={() => handleQuickSearch("Christopher Nolan")}
                    >
                      Christopher Nolan
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
                      onClick={() => handleQuickSearch("Leonardo DiCaprio")}
                    >
                      Leonardo DiCaprio
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
                      onClick={() => handleQuickSearch("Quentin Tarantino")}
                    >
                      Quentin Tarantino
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-slate-600/50 border-slate-500 text-gray-300"
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
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {t("findPerfect.features.personalized")}
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {t("findPerfect.features.availability")}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {t("findPerfect.features.matching")}
              </Badge>
            </div>

            {/* Quiz CTA Button */}
            <div className="border-t border-slate-600/50 pt-6">
              <p className="text-sm text-gray-400 mb-4">
                {t("findPerfect.quizAlternative")}
              </p>
              <Button 
                size="lg" 
                onClick={onStartQuiz}
                className="group relative px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 hover:from-blue-600 hover:via-purple-700 hover:to-blue-700"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  <span>{t("findPerfect.startQuiz")}</span>
                </span>
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
};
