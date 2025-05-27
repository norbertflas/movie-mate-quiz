
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrendingMovies, getPopularMovies } from '@/services/tmdb/trending';
import { Analytics } from '@/lib/analytics';
import { toast } from 'sonner';

export const useMovieData = () => {
  const { 
    isLoading: isTrendingLoading, 
    data: trendingMovies = [], 
    error: trendingError,
    refetch: refetchTrending
  } = useQuery({
    queryKey: ['trendingMovies', 'US', '1'],
    queryFn: getTrendingMovies,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { 
    isLoading: isPopularLoading, 
    data: popularMovies = [], 
    error: popularError,
    refetch: refetchPopular
  } = useQuery({
    queryKey: ['popularMovies', 'US', '1'],
    queryFn: getPopularMovies,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Handle errors using useEffect instead of deprecated onError
  React.useEffect(() => {
    if (trendingError) {
      console.error('Failed to load trending movies:', trendingError);
      Analytics.track('api_error', {
        endpoint: 'trending_movies',
        error: trendingError.message,
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to load trending movies. Please try again.', {
        action: {
          label: 'Retry',
          onClick: () => refetchTrending()
        }
      });
    }
  }, [trendingError, refetchTrending]);

  React.useEffect(() => {
    if (popularError) {
      console.error('Failed to load popular movies:', popularError);
      Analytics.track('api_error', {
        endpoint: 'popular_movies',
        error: popularError.message,
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to load popular movies. Please try again.', {
        action: {
          label: 'Retry',
          onClick: () => refetchPopular()
        }
      });
    }
  }, [popularError, refetchPopular]);

  // Handle success analytics
  React.useEffect(() => {
    if (trendingMovies.length > 0) {
      Analytics.track('api_success', {
        endpoint: 'trending_movies',
        count: trendingMovies.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [trendingMovies]);

  React.useEffect(() => {
    if (popularMovies.length > 0) {
      Analytics.track('api_success', {
        endpoint: 'popular_movies',
        count: popularMovies.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [popularMovies]);

  const retryAll = () => {
    refetchTrending();
    refetchPopular();
  };

  return {
    trendingMovies,
    popularMovies,
    isLoading: isTrendingLoading || isPopularLoading,
    hasError: !!trendingError || !!popularError,
    retryAll
  };
};
