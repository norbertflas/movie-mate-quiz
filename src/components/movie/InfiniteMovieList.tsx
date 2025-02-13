
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { discoverMovies } from "@/services/tmdb";
import { MovieCard } from "../MovieCard";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import type { TMDBMovie } from "@/services/tmdb";

interface MoviePageData {
  movies: TMDBMovie[];
  nextPage: number;
  hasMore: boolean;
}

export const InfiniteMovieList = () => {
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

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
      
      // Check streaming availability for each movie, but only a few at a time
      const batchSize = 3; // Process 3 movies at a time
      const results = [];
      
      for (let i = 0; i < movies.length; i += batchSize) {
        const batch = movies.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (movie) => {
            try {
              setLoadingStates(prev => ({ ...prev, [movie.id]: true }));
              const availability = await getStreamingAvailability(
                movie.id,
                movie.title,
                movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined
              );
              setLoadingStates(prev => ({ ...prev, [movie.id]: false }));
              return {
                ...movie,
                hasStreamingServices: availability.length > 0
              };
            } catch (error) {
              console.error('Error checking availability:', error);
              setLoadingStates(prev => ({ ...prev, [movie.id]: false }));
              return {
                ...movie,
                hasStreamingServices: false
              };
            }
          })
        );
        results.push(...batchResults);
        
        // Add a small delay between batches to avoid rate limits
        if (i + batchSize < movies.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Filter movies to only include those with streaming availability
      const availableMovies = results.filter(movie => movie.hasStreamingServices);

      return {
        movies: availableMovies,
        nextPage: (pageParam as number) + 1,
        hasMore: availableMovies.length > 0
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
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
                {loadingStates[movie.id] ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
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
                )}
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
