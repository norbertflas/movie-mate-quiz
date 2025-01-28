import { useRef, useCallback, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "framer-motion";
import { MovieCardBase } from "./MovieCardBase";
import { Skeleton } from "@/components/ui/skeleton";
import { discoverMovies } from "@/services/tmdb";
import type { TMDBMovie } from "@/services/tmdb/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MovieDetailsDialog } from "./MovieDetailsDialog";

export const InfiniteMovieList = () => {
  const loadMoreRef = useRef(null);
  const isLoadMoreInView = useInView(loadMoreRef);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["movies", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const movies = await discoverMovies({ page: pageParam });
      return movies;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) return undefined;
      return pages.length + 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching movies:", error);
      }
    }
  });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && isLoadMoreInView) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoadMoreInView]);

  const handleMovieClick = useCallback((movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[2/3] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || "Error loading movies. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.pages.map((page) =>
          page.map((movie: TMDBMovie) => (
            <MovieCardBase
              key={movie.id}
              title={movie.title}
              year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre={movie.genre_ids?.[0]?.toString() || "Unknown"}
              imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg"}
              description={movie.overview || "No description available"}
              trailerUrl=""
              rating={movie.vote_average * 10}
              tmdbId={movie.id}
              onClick={() => handleMovieClick(movie)}
            />
          ))
        )}
      </div>
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="py-8 text-center"
          onMouseEnter={loadMore}
        >
          {isFetchingNextPage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <MovieDetailsDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        movie={selectedMovie}
      />
    </>
  );
};