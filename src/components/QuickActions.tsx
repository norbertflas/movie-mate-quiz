import { useState } from "react";
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

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 px-4 sm:px-0">
      <FilterSheet
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        minRating={minRating}
        setMinRating={setMinRating}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
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