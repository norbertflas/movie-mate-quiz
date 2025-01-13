import { useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { MovieFilters, type MovieFilters as MovieFiltersType } from "@/components/MovieFilters";
import { TMDBMovie, getImageUrl } from "@/services/tmdb";

interface MovieSectionProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  onFilterChange: (filters: MovieFiltersType) => void;
}

export const MovieSection = ({ movies, isLoading, onFilterChange }: MovieSectionProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-64">
        <MovieFilters onFilterChange={onFilterChange} />
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
            {movies.map((movie) => (
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
  );
};