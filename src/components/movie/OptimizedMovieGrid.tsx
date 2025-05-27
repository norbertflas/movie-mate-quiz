
import { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { MovieCard } from "./MovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface OptimizedMovieGridProps {
  movies: TMDBMovie[];
  onMovieClick?: (movie: TMDBMovie) => void;
  className?: string;
  enableLazyLoad?: boolean;
}

const ITEMS_PER_PAGE = 20;
const CARD_MIN_WIDTH = 280;
const GAP = 24;

export const OptimizedMovieGrid = memo(({ 
  movies, 
  onMovieClick, 
  className,
  enableLazyLoad = true
}: OptimizedMovieGridProps) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isMobile = useIsMobile();

  // Calculate responsive columns
  const columns = useMemo(() => {
    if (typeof window === 'undefined') return 4;
    const containerWidth = window.innerWidth - 64; // Account for padding
    const columnsCount = Math.floor(containerWidth / (CARD_MIN_WIDTH + GAP));
    return Math.max(1, Math.min(columnsCount, isMobile ? 2 : 5));
  }, [isMobile]);

  // Visible movies with pagination
  const visibleMovies = useMemo(() => 
    movies.slice(0, visibleCount), [movies, visibleCount]
  );

  // Load more function
  const loadMore = useCallback(() => {
    if (visibleCount >= movies.length || isLoading) return;
    
    setIsLoading(true);
    // Simulate loading time for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, movies.length));
      setIsLoading(false);
    }, 100);
  }, [visibleCount, movies.length, isLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!enableLazyLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [loadMore, enableLazyLoad]);

  // Observe the last item
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (!enableLazyLoad || !observerRef.current) return;
    if (node) observerRef.current.observe(node);
  }, [enableLazyLoad]);

  // Helper function to get proper image URL
  const getImageUrl = useCallback((posterPath: string | null) => {
    if (!posterPath) return '/placeholder.svg';
    if (posterPath.startsWith('http')) return posterPath;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }, []);

  console.log('OptimizedMovieGrid movies:', movies.length);
  console.log('First movie poster path:', movies[0]?.poster_path);

  if (movies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No movies found</p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className={className}>
      <motion.div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="popLayout">
          {visibleMovies.map((movie, index) => {
            const imageUrl = getImageUrl(movie.poster_path);
            console.log(`Movie ${movie.title} image URL:`, imageUrl);
            
            return (
              <motion.div
                key={movie.id}
                ref={index === visibleMovies.length - 1 ? lastItemRef : undefined}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index % ITEMS_PER_PAGE * 0.02,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <MovieCard
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                  platform="TMDB"
                  genre="Film"
                  imageUrl={imageUrl}
                  description={movie.overview}
                  trailerUrl=""
                  rating={movie.vote_average * 10}
                  tmdbId={movie.id}
                  onClick={() => onMovieClick?.(movie)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading more movies...</span>
          </div>
        </motion.div>
      )}

      {/* Load more button (fallback) */}
      {!enableLazyLoad && visibleCount < movies.length && (
        <motion.div 
          className="flex justify-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </motion.div>
      )}
    </div>
  );
});

OptimizedMovieGrid.displayName = "OptimizedMovieGrid";
