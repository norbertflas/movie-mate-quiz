
import { useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  width = 300,
  height = 450,
  priority = false
}: OptimizedMovieImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // Generate different image sizes for responsive loading
  const generateSrcSet = useCallback((url: string) => {
    if (!url || !url.includes('image.tmdb.org')) return '';
    
    const baseUrl = url.replace('/w500', '');
    return [
      `${baseUrl}/w185 185w`,
      `${baseUrl}/w342 342w`,
      `${baseUrl}/w500 500w`,
      `${baseUrl}/w780 780w`
    ].join(', ');
  }, []);

  const srcSet = imageUrl && !hasError ? generateSrcSet(imageUrl) : '';
  const src = hasError ? "/placeholder.svg" : (imageUrl || "/placeholder.svg");

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-t-lg" />
      )}
      
      <motion.img
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 768px) 185px, (max-width: 1024px) 342px, 500px"
        alt={title}
        className={cn(
          "absolute inset-0 object-cover w-full h-full rounded-t-lg transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "opacity-50"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        loading={priority ? "eager" : loading}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  );
});

OptimizedMovieImage.displayName = "OptimizedMovieImage";
