import { useState, useEffect } from "react";
import { QuizSection } from "@/components/QuizSection";
import { SearchBar } from "@/components/SearchBar";
import { QuickActions } from "@/components/QuickActions";
import { WelcomeSection } from "@/components/WelcomeSection";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { MovieCard } from "@/components/MovieCard";
import { UserStreamingPreferences } from "@/components/UserStreamingPreferences";
import { FavoriteCreators } from "@/components/creators/FavoriteCreators";
import { getPopularMovies, type TMDBMovie, getImageUrl } from "@/services/tmdb";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

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
          <WelcomeSection onStartQuiz={handleStartQuiz} />
          <QuickActions />
          <div className="mb-8">
            <FavoriteCreators />
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-64">
              <MovieFilters onFilterChange={handleFilterChange} />
            </aside>
            <main className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      title={movie.title}
                      year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                      platform="TMDB"
                      genre="Film"
                      imageUrl={getImageUrl(movie.poster_path)}
                      description={movie.overview}
                      trailerUrl=""
                      rating={movie.vote_average * 10}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </>
      ) : (
        <QuizSection />
      )}
    </div>
  );
};

export default Index;