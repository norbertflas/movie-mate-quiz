
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
  const [isMaximized, setIsMaximized] = useState(initialState === 'maximized');

  const handleExpand = useCallback(() => {
    setIsMaximized(true);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMaximized(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsMaximized(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  // Always render something, never return null
  const movieProps = {
    title,
    year,
    platform,
    genre,
    imageUrl,
    description,
    trailerUrl,
    rating,
    ...props
  };

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
});

MovieCardSwitcher.displayName = "MovieCardSwitcher";
