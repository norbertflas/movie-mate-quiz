
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MovieSection } from "@/components/home/MovieSection";
import { QuickActions } from "@/components/QuickActions";
import { FavoriteCreatorsList } from "@/components/creators/FavoriteCreatorsList";
import { getPopularMovies } from "@/services/tmdb";
import type { MovieFilters as MovieFiltersType } from "@/components/MovieFilters";

export const RecommendationsPage = () => {
  const { t } = useTranslation();
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

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

  const handleToggleFilters = () => {
    setShowAdvancedFilters(prev => !prev);
  };

  const handleToggleWatchlist = () => {
    setShowWatchlist(prev => !prev);
  };

  const userPreferences = {
    watchlist: []
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">{t("recommendations.title")}</h1>
      
      <section>
        <FavoriteCreatorsList />
      </section>

      <section>
        <QuickActions 
          onToggleFilters={handleToggleFilters}
          onToggleWatchlist={handleToggleWatchlist}
          showAdvancedFilters={showAdvancedFilters}
          showWatchlist={showWatchlist}
          userPreferences={userPreferences}
        />
        <MovieSection 
          movies={filteredMovies.length > 0 ? filteredMovies : movies}
          isLoading={isLoading}
          onFilterChange={handleFilterChange}
        />
      </section>
    </div>
  );
};
