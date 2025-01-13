import { useState, useEffect } from "react";
import { QuizSection } from "@/components/QuizSection";
import { HomeHeader } from "@/components/home/HomeHeader";
import { getPopularMovies, type TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import type { MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SearchSection } from "@/components/sections/SearchSection";
import { PreferencesSection } from "@/components/sections/PreferencesSection";
import { ContentSection } from "@/components/sections/ContentSection";
import { MovieFilterSection } from "@/components/sections/MovieFilterSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
        setFilteredMovies(popularMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast({
          title: t("errors.loadingServices"),
          description: t("errors.errorDescription"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleFilterChange = (filters: MovieFiltersType) => {
    const filtered = movies.filter(movie => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
      const rating = movie.vote_average;

      const matchesYear = year >= filters.yearRange[0] && year <= filters.yearRange[1];
      const matchesRating = (rating * 10) >= filters.minRating;

      return matchesYear && matchesRating;
    });

    setFilteredMovies(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/80 to-background/40">
      <div className="container mx-auto px-4 py-8 space-y-8 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500 mb-4">
              {t("services.title")}
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              {t("services.description")}
            </p>
            <PreferencesSection />
          </Card>

          <SearchSection />

          {!showQuiz ? (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
                  <HomeHeader onStartQuiz={handleStartQuiz} />
                </Card>
              </motion.div>

              <ContentSection />
              
              <MovieFilterSection 
                movies={filteredMovies}
                isLoading={isLoading}
                onFilterChange={handleFilterChange}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
                <QuizSection />
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;