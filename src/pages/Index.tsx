import { useState } from "react";
import { QuizSection } from "@/components/QuizSection";
import { SearchBar } from "@/components/SearchBar";
import { QuickActions } from "@/components/QuickActions";
import { WelcomeSection } from "@/components/WelcomeSection";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { SAMPLE_RECOMMENDATIONS } from "@/components/quiz/QuizConstants";
import { MovieCard } from "@/components/MovieCard";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState(SAMPLE_RECOMMENDATIONS);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleFilterChange = (filters: MovieFiltersType) => {
    const filtered = SAMPLE_RECOMMENDATIONS.filter(movie => {
      const matchesPlatform = !filters.platform || movie.platform === filters.platform;
      const matchesGenre = !filters.genre || movie.genre === filters.genre;
      const matchesYear = parseInt(movie.year) >= filters.yearRange[0] && 
                         parseInt(movie.year) <= filters.yearRange[1];
      const matchesRating = movie.rating >= filters.minRating;

      return matchesPlatform && matchesGenre && matchesYear && matchesRating;
    });

    setFilteredMovies(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar />
      {!showQuiz ? (
        <>
          <WelcomeSection onStartQuiz={handleStartQuiz} />
          <QuickActions />
          <div className="flex gap-6">
            <aside className="w-64 hidden lg:block">
              <MovieFilters onFilterChange={handleFilterChange} />
            </aside>
            <main className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.title} {...movie} />
                ))}
              </div>
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