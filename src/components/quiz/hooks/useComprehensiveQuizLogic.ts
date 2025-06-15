
import { useState } from 'react';
import { getMovieDetails } from '@/services/tmdb/movies';
import type { QuizPreferences, MovieRecommendation, TMDB_GENRE_MAPPING, SERVICE_LINKS } from '../types/comprehensiveQuizTypes';

export const useComprehensiveQuizLogic = () => {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = (era: string) => {
    const currentYear = new Date().getFullYear();
    
    switch (era) {
      case 'Latest releases (2020-2024)':
        return { 'primary_release_date.gte': '2020-01-01' };
      case 'Modern classics (2010-2019)':
        return { 
          'primary_release_date.gte': '2010-01-01',
          'primary_release_date.lte': '2019-12-31'
        };
      case 'Golden era (2000-2009)':
        return {
          'primary_release_date.gte': '2000-01-01',
          'primary_release_date.lte': '2009-12-31'
        };
      case 'Vintage movies (before 2000)':
        return { 'primary_release_date.lte': '1999-12-31' };
      default:
        return {};
    }
  };

  const getRuntimeRange = (length: string) => {
    switch (length) {
      case 'Short movies (under 90 min)':
        return { 'with_runtime.lte': 90 };
      case 'Standard length (90-120 min)':
        return { 
          'with_runtime.gte': 90,
          'with_runtime.lte': 120
        };
      case 'Long movies (120+ min)':
        return { 'with_runtime.gte': 120 };
      default:
        return {};
    }
  };

  const getCertification = (rating: string) => {
    switch (rating) {
      case 'Family-friendly (G, PG)':
        return { certification: 'G,PG' };
      case 'Teen appropriate (PG-13)':
        return { certification: 'PG-13' };
      case 'Adult content (R)':
        return { certification: 'R' };
      default:
        return {};
    }
  };

  const getGenreIds = (genres: string[]): string => {
    const genreMapping: typeof TMDB_GENRE_MAPPING = {
      'Action': 28,
      'Comedy': 35,
      'Drama': 18,
      'Horror': 27,
      'Sci-Fi': 878,
      'Romance': 10749,
      'Thriller': 53,
      'Animation': 16,
      'Documentary': 99,
      'Fantasy': 14
    };

    return genres
      .map(genre => genreMapping[genre])
      .filter(Boolean)
      .join(',');
  };

  const getStreamingAvailability = async (movieId: number): Promise<any[]> => {
    try {
      const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
      if (!accessToken) return getFallbackServices();

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) return getFallbackServices();

      const data = await response.json();
      const usData = data.results?.US;
      
      if (!usData) return getFallbackServices();

      const services: any[] = [];

      // Add subscription services
      if (usData.flatrate) {
        services.push(...usData.flatrate.map((provider: any) => ({
          service: provider.provider_name,
          type: 'subscription',
          link: usData.link || getServiceLink(provider.provider_name),
          logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`
        })));
      }

      // Add rental options
      if (usData.rent) {
        services.push(...usData.rent.map((provider: any) => ({
          service: provider.provider_name,
          type: 'rent',
          link: usData.link || getServiceLink(provider.provider_name),
          logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`
        })));
      }

      return services.length > 0 ? services : getFallbackServices();
    } catch (error) {
      console.error('Error fetching streaming data:', error);
      return getFallbackServices();
    }
  };

  const getServiceLink = (serviceName: string): string => {
    const serviceLinks: typeof SERVICE_LINKS = {
      'Netflix': 'https://netflix.com',
      'Amazon Prime Video': 'https://amazon.com/prime-video',
      'Disney+': 'https://disneyplus.com',
      'Hulu': 'https://hulu.com',
      'HBO Max': 'https://max.com',
      'Apple TV+': 'https://tv.apple.com',
      'Paramount+': 'https://paramountplus.com'
    };

    return serviceLinks[serviceName] || '#';
  };

  const getFallbackServices = () => {
    return [
      { service: 'Netflix', type: 'subscription' as const, link: 'https://netflix.com' },
      { service: 'Amazon Prime Video', type: 'subscription' as const, link: 'https://amazon.com/prime-video' },
      { service: 'Disney+', type: 'subscription' as const, link: 'https://disneyplus.com' }
    ];
  };

  const getRecommendations = async (preferences: QuizPreferences) => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('TMDB access token not found');
      }

      // Build query parameters
      const params = new URLSearchParams({
        'sort_by': 'popularity.desc',
        'page': '1',
        'vote_average.gte': '6.0'
      });

      // Add genre filter
      if (preferences.genres.length > 0 && !preferences.genres.includes('No preference')) {
        const genreIds = getGenreIds(preferences.genres);
        if (genreIds) {
          params.append('with_genres', genreIds);
        }
      }

      // Add date range
      const dateRange = getDateRange(preferences.era);
      Object.entries(dateRange).forEach(([key, value]) => {
        params.append(key, value);
      });

      // Add runtime range
      const runtimeRange = getRuntimeRange(preferences.length);
      Object.entries(runtimeRange).forEach(([key, value]) => {
        params.append(key, value.toString());
      });

      // Add certification
      const certification = getCertification(preferences.rating);
      Object.entries(certification).forEach(([key, value]) => {
        params.append(key, value);
      });

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      const movies = data.results?.slice(0, 9) || [];

      // Process each movie and add streaming data
      const processedMovies = await Promise.all(
        movies.map(async (movie: any) => {
          const streaming = await getStreamingAvailability(movie.id);
          
          return {
            id: movie.id,
            title: movie.title,
            year: new Date(movie.release_date || '2023').getFullYear(),
            poster: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/placeholder.svg',
            overview: movie.overview || 'No description available.',
            genres: movie.genre_ids?.map((id: number) => {
              const genreMap: Record<number, string> = {
                28: 'Action', 35: 'Comedy', 18: 'Drama', 27: 'Horror',
                878: 'Sci-Fi', 10749: 'Romance', 53: 'Thriller',
                16: 'Animation', 99: 'Documentary', 14: 'Fantasy'
              };
              return genreMap[id];
            }).filter(Boolean) || [],
            rating: movie.vote_average || 0,
            streaming,
            tmdbId: movie.id,
            backdrop: movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
              : undefined
          };
        })
      );

      setRecommendations(processedMovies);
      setIsComplete(true);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
      
      // Provide fallback recommendations
      const fallbackMovies = getFallbackRecommendations();
      setRecommendations(fallbackMovies);
      setIsComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackRecommendations = (): MovieRecommendation[] => {
    return [
      {
        id: 550,
        title: "Fight Club",
        year: 1999,
        poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
        genres: ["Drama", "Thriller"],
        rating: 8.4,
        streaming: getFallbackServices(),
        tmdbId: 550
      },
      {
        id: 238,
        title: "The Godfather",
        year: 1972,
        poster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        overview: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
        genres: ["Drama"],
        rating: 9.2,
        streaming: getFallbackServices(),
        tmdbId: 238
      },
      {
        id: 13,
        title: "Forrest Gump",
        year: 1994,
        poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        overview: "The presidencies of Kennedy and Johnson through the eyes of an Alabama man.",
        genres: ["Drama", "Romance"],
        rating: 8.8,
        streaming: getFallbackServices(),
        tmdbId: 13
      }
    ];
  };

  return {
    recommendations,
    isLoading,
    isComplete,
    error,
    getRecommendations
  };
};
