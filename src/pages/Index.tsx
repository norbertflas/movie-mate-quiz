import { useState, useEffect } from "react";
import { QuizSection } from "@/components/QuizSection";
import { SearchBar } from "@/components/SearchBar";
import { UserStreamingPreferences } from "@/components/UserStreamingPreferences";
import { FavoriteCreators } from "@/components/creators/FavoriteCreators";
import { MovieLists } from "@/components/movie/MovieLists";
import { HomeHeader } from "@/components/home/HomeHeader";
import { MovieSection } from "@/components/home/MovieSection";
import { getPopularMovies, type TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import type { MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { Card } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-6 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mb-8">
            <UserStreamingPreferences />
          </div>
          
          <div className="mb-8">
            <SearchBar />
          </div>
        </Card>

        {!showQuiz ? (
          <div className="space-y-8">
            <Card className="p-6 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <HomeHeader onStartQuiz={handleStartQuiz} />
            </Card>

            <Card className="p-6 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-8">
                <FavoriteCreators />
              </div>
            </Card>

            <Card className="p-6 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-8">
                <MovieLists />
              </div>
            </Card>

            <Card className="p-6 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <MovieSection 
                movies={filteredMovies}
                isLoading={isLoading}
                onFilterChange={handleFilterChange}
              />
            </Card>
          </div>
        ) : (
          <Card className="p-6 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <QuizSection />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;