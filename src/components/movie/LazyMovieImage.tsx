
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LazyMovieImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
}

export const LazyMovieImage = memo(({
  src,
  alt,
  className,
  priority = false,
  onLoad,
  onError,
  placeholder = "/placeholder.svg"
}: LazyMovieImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Generate optimized image URLs
  const generateSrcSet = useCallback(() => {
    if (!src || !src.includes('image.tmdb.org')) return '';
    
    const baseUrl = src.replace(/\/w\d+/, '');
    return [
      `${baseUrl}/w185 185w`,
      `${baseUrl}/w342 342w`, 
      `${baseUrl}/w500 500w`,
      `${baseUrl}/w780 780w`
    ].join(', ');
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before image comes into view
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => observerRef.current?.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsError(true);
    onError?.();
  }, [onError]);

  const imageSrc = isError ? placeholder : src;
  const srcSet = !isError ? generateSrcSet() : '';

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-muted", className)}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}

      {/* Image */}
      {isInView && (
        <motion.img
          src={imageSrc}
          srcSet={srcSet}
          sizes="(max-width: 768px) 185px, (max-width: 1024px) 342px, 500px"
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          initial={{ scale: 1.1 }}
          animate={{ 
            scale: isLoaded ? 1 : 1.1,
            opacity: isLoaded ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
});

LazyMovieImage.displayName = "LazyMovieImage";
