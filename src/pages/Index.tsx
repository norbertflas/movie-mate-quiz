import { useState, useEffect } from "react";
import { getPopularMovies, type TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import type { MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { SearchSection } from "@/components/sections/SearchSection";
import { PageContainer } from "@/components/home/PageContainer";
import { ServicesSection } from "@/components/home/ServicesSection";
import { MainContent } from "@/components/home/MainContent";
import { QuizContent } from "@/components/home/QuizContent";
import { TrendingMoviesSection } from "@/components/sections/TrendingMoviesSection";
import { RecentlyViewedSection } from "@/components/sections/RecentlyViewedSection";

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
    <PageContainer>
      <ServicesSection />
      <SearchSection />
      <div className="space-y-8">
        <TrendingMoviesSection />
        <RecentlyViewedSection />
        {!showQuiz ? (
          <MainContent
            onStartQuiz={handleStartQuiz}
            filteredMovies={filteredMovies}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
          />
        ) : (
          <QuizContent />
        )}
      </div>
    </PageContainer>
  );
};

export default Index;