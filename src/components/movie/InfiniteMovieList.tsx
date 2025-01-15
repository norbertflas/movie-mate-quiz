import { useInfiniteQuery } from "@tanstack/react-query";
import { getTrendingMovies } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const InfiniteMovieList = () => {
  const { t } = useTranslation();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['infiniteMovies', ''],
    queryFn: getTrendingMovies,
    getNextPageParam: (lastPage, pages) => pages.length + 1,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.pages.map((page, pageIndex) =>
          page.map((movie, movieIndex) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: movieIndex * 0.1 }}
            >
              <MovieCard
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                platform="TMDB"
                genre={t("movie.genre")}
                imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
                description={movie.overview}
                trailerUrl=""
                rating={movie.vote_average * 10}
                tmdbId={movie.id}
              />
            </motion.div>
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-w-[200px]"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("actions.loadMore")
            )}
          </Button>
        </div>
      )}
    </div>
  );
};