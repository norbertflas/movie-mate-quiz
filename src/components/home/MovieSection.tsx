
import { SmartMovieSection } from "./SmartMovieSection";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { TMDBMovie } from "@/services/tmdb";
import { useState, useEffect } from "react";

interface MovieSectionProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  onFilterChange: (filters: MovieFiltersType) => void;
}

export const MovieSection = ({ movies, isLoading, onFilterChange }: MovieSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('movie-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div id="movie-section">
      <SmartMovieSection
        movies={movies}
        isLoading={isLoading}
        onFilterChange={onFilterChange}
        title="Discover Movies"
        mode="lazy" // Use lazy mode for home page for better performance
      />
    </div>
  );
};
