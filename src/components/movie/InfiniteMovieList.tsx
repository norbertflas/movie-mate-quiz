import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MovieCard } from "./MovieCard";
import { getPopularMovies } from "@/services/tmdb";
import { useToast } from "../ui/use-toast";
import { useTranslation } from "react-i18next";
import type { TMDBMovie } from "@/services/tmdb";

export const InfiniteMovieList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ['infiniteMovies'],
    queryFn: async ({ pageParam = 1 }) => {
      const movies = await getPopularMovies();
      return movies as TMDBMovie[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: t("errors.fetchError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  }, [error, toast, t]);

  if (status === "pending") {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((group, i) => (
          <div key={i}>
            {group.map((movie: TMDBMovie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                platform="TMDB"
                genre={t("movie.genre")}
                imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                description={movie.overview}
                trailerUrl=""
                rating={movie.vote_average * 10}
                tmdbId={movie.id}
              />
            ))}
          </div>
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isFetchingNextPage ? t("loading") : t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
};