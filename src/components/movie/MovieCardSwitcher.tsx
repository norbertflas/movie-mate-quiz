
import { useState, memo, useCallback } from "react";
import { ImprovedMinimizedMovieCard } from "./ImprovedMinimizedMovieCard";
import { ImprovedMaximizedMovieCard } from "./ImprovedMaximizedMovieCard";
import type { MovieCardProps } from "@/types/movie";

interface MovieCardSwitcherProps extends MovieCardProps {
  initialState?: 'minimized' | 'maximized';
}

export const MovieCardSwitcher = memo(({
  initialState = 'minimized',
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
    props.onClose?.();
  }, [props]);

  if (isMaximized) {
    return (
      <ImprovedMaximizedMovieCard
        {...props}
        onMinimize={handleMinimize}
        onClose={handleClose}
      />
    );
  }

  return (
    <ImprovedMinimizedMovieCard
      {...props}
      onExpand={handleExpand}
    />
  );
});

MovieCardSwitcher.displayName = "MovieCardSwitcher";
