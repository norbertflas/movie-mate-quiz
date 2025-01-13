import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPopularMovies } from "@/services/tmdb";
import { FilterSheet } from "./actions/FilterSheet";
import { RandomMovieButton } from "./actions/RandomMovieButton";
import { TopRatedButton } from "./actions/TopRatedButton";

export const QuickActions = () => {
  const [minRating, setMinRating] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

  const { data: movies = [] } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

  const handleMinRatingChange = useCallback((value: number) => {
    setMinRating(value);
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 px-4 sm:px-0">
      <FilterSheet
        selectedGenre={selectedGenre}
        setSelectedGenre={handleGenreChange}
        minRating={minRating}
        setMinRating={handleMinRatingChange}
        isOpen={isOpen}
        setIsOpen={handleOpenChange}
      />
      
      <RandomMovieButton 
        movies={movies}
        minRating={minRating}
        selectedGenre={selectedGenre}
      />

      <TopRatedButton movies={movies} />
    </div>
  );
};