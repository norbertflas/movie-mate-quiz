
import { useState, memo, useCallback } from "react";
import { ImprovedMinimizedMovieCard } from "./ImprovedMinimizedMovieCard";
import { ImprovedMaximizedMovieCard } from "./ImprovedMaximizedMovieCard";
import type { MovieCardProps } from "@/types/movie";

interface MovieCardSwitcherProps extends MovieCardProps {
  initialState?: 'minimized' | 'maximized';
}

export const MovieCardSwitcher = memo(({
  initialState = 'minimized',
  title = "Unknown Movie",
  year = "N/A",
  platform = "Unknown",
  genre = "",
  imageUrl = '/placeholder.svg',
  description = "",
  trailerUrl = "",
  rating = 0,
  ...props
}: MovieCardSwitcherProps) => {
  console.log('MovieCardSwitcher rendering with title:', title);
  
  const [isMaximized, setIsMaximized] = useState(initialState === 'maximized');

  const handleExpand = useCallback(() => {
    console.log('Expanding movie card:', title);
    setIsMaximized(true);
  }, [title]);

  const handleMinimize = useCallback(() => {
    console.log('Minimizing movie card:', title);
    setIsMaximized(false);
  }, [title]);

  const handleClose = useCallback(() => {
    console.log('Closing movie card:', title);
    setIsMaximized(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props, title]);

  // Ensure we always have valid props
  const movieProps = {
    title: title || "Unknown Movie",
    year: year || "N/A",
    platform: platform || "Unknown",
    genre: genre || "",
    imageUrl: imageUrl || '/placeholder.svg',
    description: description || "",
    trailerUrl: trailerUrl || "",
    rating: rating || 0,
    ...props
  };

  try {
    if (isMaximized) {
      return (
        <ImprovedMaximizedMovieCard
          {...movieProps}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      );
    }

    return (
      <ImprovedMinimizedMovieCard
        {...movieProps}
        onExpand={handleExpand}
      />
    );
  } catch (error) {
    console.error('Error in MovieCardSwitcher:', error);
    return (
      <div className="w-64 h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-400">Błąd ładowania karty</span>
      </div>
    );
  }
});

MovieCardSwitcher.displayName = "MovieCardSwitcher";
