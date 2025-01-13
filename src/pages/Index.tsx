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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <UserStreamingPreferences />
      </div>
      <SearchBar />
      {!showQuiz ? (
        <>
          <HomeHeader onStartQuiz={handleStartQuiz} />
          <div className="mb-8">
            <FavoriteCreators />
          </div>
          <div className="mb-8">
            <MovieLists />
          </div>
          <MovieSection 
            movies={filteredMovies}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
          />
        </>
      ) : (
        <QuizSection />
      )}
    </div>
  );
};

export default Index;