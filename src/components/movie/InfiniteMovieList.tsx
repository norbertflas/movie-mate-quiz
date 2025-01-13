import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { MovieCard } from "../MovieCard";
import { LoadingState } from "../LoadingState";
import { getPopularMovies } from "@/services/tmdb";
import { useToast } from "../ui/use-toast";
import { useTranslation } from "react-i18next";

export const InfiniteMovieList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const loadMoreRef = useRef(null);
  const isLoadMoreInView = useInView(loadMoreRef);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['infiniteMovies'],
    queryFn: async ({ pageParam = 1 }) => {
      const movies = await getPopularMovies(pageParam);
      return movies;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageSize: 20,
  });

  useEffect(() => {
    if (isLoadMoreInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isLoadMoreInView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === "error") {
    toast({
      title: t("errors.loadingMovies"),
      description: t("errors.tryAgain"),
      variant: "destructive",
    });
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((group, i) => (
          group.map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
              platform="TMDB"
              genre={movie.genre_ids[0]?.toString() || "Film"}
              imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              description={movie.overview}
              trailerUrl=""
              rating={movie.vote_average * 10}
              tmdbId={movie.id}
            />
          ))
        ))}
      </div>
      
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && <LoadingState />}
      </div>
    </div>
  );
};