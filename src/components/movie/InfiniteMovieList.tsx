import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { discoverMovies } from "@/services/tmdb";
import { MovieCard } from "../MovieCard";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/hooks/use-toast";

interface MoviePageData {
  movies: TMDBMovie[];
  nextPage: number;
  hasMore: boolean;
}

export const InfiniteMovieList = () => {
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<MoviePageData>({
    queryKey: ['discoverMovies'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const movies = await discoverMovies({ page: pageParam as number });
      
      return {
        movies,
        nextPage: (pageParam as number) + 1,
        hasMore: movies.length > 0
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    retry: false, // Disable automatic retries
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-auto max-h-[800px]" onScroll={handleScroll}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((page, pageIndex) => (
          <motion.div 
            key={pageIndex}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {page.movies.map((movie) => (
              <motion.div
                key={movie.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut"
                    }
                  }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <MovieCard
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                  platform="TMDB"
                  genre="Film"
                  imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  description={movie.overview}
                  trailerUrl=""
                  rating={movie.vote_average * 10}
                  tmdbId={movie.id}
                />
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
      
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
