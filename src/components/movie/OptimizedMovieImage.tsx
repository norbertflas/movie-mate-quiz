
import { memo } from "react";
import { LazyMovieImage } from "./LazyMovieImage";

interface OptimizedMovieImageProps {
  imageUrl?: string;
  title: string;
  className?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
  priority?: boolean;
}

export const OptimizedMovieImage = memo(({ 
  imageUrl, 
  title,
  className,
  loading = "lazy",
  priority = false
}: OptimizedMovieImageProps) => {
  return (
    <LazyMovieImage
      src={imageUrl || "/placeholder.svg"}
      alt={title}
      className={className}
      priority={priority || loading === "eager"}
    />
  );
});

OptimizedMovieImage.displayName = "OptimizedMovieImage";
