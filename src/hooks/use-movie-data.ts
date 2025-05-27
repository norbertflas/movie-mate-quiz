
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
    onError: (error: any) => {
      console.error('Failed to load trending movies:', error);
      Analytics.track('api_error', {
        endpoint: 'trending_movies',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to load trending movies. Please try again.', {
        action: {
          label: 'Retry',
          onClick: () => refetchTrending()
        }
      });
    },
    onSuccess: (data: any) => {
      Analytics.track('api_success', {
        endpoint: 'trending_movies',
        count: data.length,
        timestamp: new Date().toISOString()
      });
    }
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
    onError: (error: any) => {
      console.error('Failed to load popular movies:', error);
      Analytics.track('api_error', {
        endpoint: 'popular_movies',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to load popular movies. Please try again.', {
        action: {
          label: 'Retry',
          onClick: () => refetchPopular()
        }
      });
    },
    onSuccess: (data: any) => {
      Analytics.track('api_success', {
        endpoint: 'popular_movies',
        count: data.length,
        timestamp: new Date().toISOString()
      });
    }
  });

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
