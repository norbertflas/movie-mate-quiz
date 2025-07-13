
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMovieDetails } from '@/services/tmdb/movies';
import { getUserCountry } from '@/services/streamingAvailabilityPro';
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
      const userCountry = getUserCountry();
      
      console.log(`🎬 Getting streaming data for movie ${movieId} in ${userCountry}`);
      
      // Call our MovieOfTheNight edge function
      const { data, error } = await supabase.functions.invoke('streaming-availability', {
        body: { 
          tmdbId: movieId, 
          country: userCountry 
        }
      });

      if (error) {
        console.error('❌ Error calling streaming-availability function:', error);
        return getFallbackServices(userCountry);
      }

      if (!data?.result || !Array.isArray(data.result)) {
        console.log('⚠️ No streaming data returned from API');
        return getFallbackServices(userCountry);
      }

      console.log(`🌍 Found ${data.result.length} streaming services for ${userCountry}:`, 
        data.result.map((s: any) => s.service).join(', '));
      
      return data.result;
    } catch (error) {
      console.error('❌ Error getting streaming availability:', error);
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

  const getFallbackServices = (country?: string) => {
    const userCountry = country || getUserCountry();
    
    const servicesByRegion: Record<string, any[]> = {
      'pl': [
        { service: 'Netflix', type: 'subscription' as const, link: 'https://netflix.com' },
        { service: 'Amazon Prime Video', type: 'subscription' as const, link: 'https://amazon.com/prime-video' },
        { service: 'Disney+', type: 'subscription' as const, link: 'https://disneyplus.com' },
        { service: 'Canal+', type: 'subscription' as const, link: 'https://canalplus.pl' },
        { service: 'Player.pl', type: 'subscription' as const, link: 'https://player.pl' }
      ],
      'us': [
        { service: 'Netflix', type: 'subscription' as const, link: 'https://netflix.com' },
        { service: 'Amazon Prime Video', type: 'subscription' as const, link: 'https://amazon.com/prime-video' },
        { service: 'Disney+', type: 'subscription' as const, link: 'https://disneyplus.com' },
        { service: 'Hulu', type: 'subscription' as const, link: 'https://hulu.com' }
      ]
    };
    
    return servicesByRegion[userCountry] || servicesByRegion['us'];
  };

  const getRecommendations = async (preferences: QuizPreferences) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get TMDB API key from Supabase edge function
      const { data: tmdbKeyData, error: keyError } = await supabase.functions.invoke('get-tmdb-key');
      
      if (keyError || !tmdbKeyData?.TMDB_API_KEY) {
        throw new Error('Failed to get TMDB API key');
      }
      
      const TMDB_API_KEY = tmdbKeyData.TMDB_API_KEY;

      // Build query parameters
      const params = new URLSearchParams({
        'api_key': TMDB_API_KEY,
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

      // Add certification (only for US region)
      const certification = getCertification(preferences.rating);
      if (Object.keys(certification).length > 0) {
        params.append('certification_country', 'US');
        Object.entries(certification).forEach(([key, value]) => {
          params.append(key, value);
        });
      }

      console.log('🎬 Quiz API call with params:', params.toString());

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?${params}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const movies = data.results?.slice(0, 5) || [];

      console.log('🎭 Got movies from TMDB:', movies.length);

      if (movies.length === 0) {
        throw new Error('No movies found matching preferences');
      }

      // Process each movie and add streaming data
      const processedMovies = await Promise.all(
        movies.map(async (movie: any) => {
          // Skip movies that are not yet released
          if (movie.release_date) {
            const releaseDate = new Date(movie.release_date);
            const today = new Date();
            if (releaseDate > today) {
              console.log(`⏩ Skipping upcoming movie: ${movie.title} (${movie.release_date})`);
              return null; // Skip this movie
            }
          }

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

      // Filter out null values (upcoming movies)
      const validMovies = processedMovies.filter(movie => movie !== null);

      console.log('🎬 Valid movies after filtering upcoming:', validMovies.length);

      // Filter movies by selected streaming platforms
      let filteredMovies = validMovies;
      if (preferences.platforms.length > 0 && !preferences.platforms.includes("I don't have a preference")) {
        filteredMovies = validMovies.filter(movie => {
          // Check if movie is available on any of the user's preferred platforms
          return movie.streaming.some((streamingService: any) => 
            preferences.platforms.includes(streamingService.service)
          );
        });
        
        console.log('🎯 Movies filtered by platforms:', filteredMovies.length, 'from', validMovies.length);
        
        // If we have too few movies after platform filtering, get more from TMDB
        if (filteredMovies.length < 3 && validMovies.length > 0) {
          console.log('⚠️ Too few movies after platform filtering, adding more...');
          // Keep all movies but prioritize platform-available ones
          const platformMovies = filteredMovies;
          const otherMovies = validMovies.filter(movie => !filteredMovies.includes(movie));
          filteredMovies = [...platformMovies, ...otherMovies.slice(0, 5 - platformMovies.length)];
        }
      }

      console.log('✅ Final quiz recommendations:', filteredMovies.length);
      setRecommendations(filteredMovies);
      setIsComplete(true);
    } catch (err) {
      console.error('❌ Error getting quiz recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
      
      // Provide enhanced fallback recommendations based on preferences
      const fallbackMovies = getEnhancedFallbackRecommendations(preferences);
      setRecommendations(fallbackMovies);
      setIsComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnhancedFallbackRecommendations = (preferences: QuizPreferences): MovieRecommendation[] => {
    // Enhanced fallback based on preferences
    const allMovies = [
      // Action movies
      {
        id: 155,
        title: "The Dark Knight",
        year: 2008,
        poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        overview: "Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        genres: ["Action", "Drama"],
        rating: 9.0,
        streaming: getFallbackServices(),
        tmdbId: 155
      },
      {
        id: 245891,
        title: "John Wick",
        year: 2014,
        poster: "/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
        overview: "An ex-hitman comes out of retirement to track down the gangsters that took everything from him.",
        genres: ["Action", "Thriller"],
        rating: 7.4,
        streaming: getFallbackServices(),
        tmdbId: 245891
      },
      // Comedy movies
      {
        id: 12,
        title: "Finding Nemo",
        year: 2003,
        poster: "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
        overview: "A clown fish named Marlin lives in the Great Barrier Reef and loses his son, Nemo.",
        genres: ["Animation", "Comedy"],
        rating: 8.2,
        streaming: getFallbackServices(),
        tmdbId: 12
      },
      {
        id: 862,
        title: "Toy Story",
        year: 1995,
        poster: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
        overview: "A cowboy doll is profoundly threatened when a new spaceman figure supplants him as top toy.",
        genres: ["Animation", "Comedy"],
        rating: 8.3,
        streaming: getFallbackServices(),
        tmdbId: 862
      },
      // Drama movies
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
      // Sci-Fi movies
      {
        id: 603,
        title: "The Matrix",
        year: 1999,
        poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        overview: "A computer hacker learns from mysterious rebels about the true nature of his reality.",
        genres: ["Sci-Fi", "Action"],
        rating: 8.7,
        streaming: getFallbackServices(),
        tmdbId: 603
      },
      {
        id: 19995,
        title: "Avatar",
        year: 2009,
        poster: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
        overview: "A paraplegic Marine dispatched to the moon Pandora on a unique mission.",
        genres: ["Sci-Fi", "Adventure"],
        rating: 7.6,
        streaming: getFallbackServices(),
        tmdbId: 19995
      },
      // Horror movies
      {
        id: 694,
        title: "The Shining",
        year: 1980,
        poster: "/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg",
        overview: "A family heads to an isolated hotel for the winter where an evil presence influences the father.",
        genres: ["Horror", "Thriller"],
        rating: 8.2,
        streaming: getFallbackServices(),
        tmdbId: 694
      },
      // Romance movies
      {
        id: 597,
        title: "Titanic",
        year: 1997,
        poster: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
        overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the Titanic.",
        genres: ["Romance", "Drama"],
        rating: 7.9,
        streaming: getFallbackServices(),
        tmdbId: 597
      }
    ];

    // Filter by selected genres
    let filteredMovies = allMovies;
    if (preferences.genres.length > 0 && !preferences.genres.includes("No preference")) {
      filteredMovies = allMovies.filter(movie => 
        movie.genres.some(genre => preferences.genres.includes(genre))
      );
    }

    // Filter by era
    if (preferences.era !== "No preference") {
      filteredMovies = filteredMovies.filter(movie => {
        switch (preferences.era) {
          case 'Latest releases (2020-2024)':
            return movie.year >= 2020;
          case 'Modern classics (2010-2019)':
            return movie.year >= 2010 && movie.year <= 2019;
          case 'Golden era (2000-2009)':
            return movie.year >= 2000 && movie.year <= 2009;
          case 'Vintage movies (before 2000)':
            return movie.year < 2000;
          default:
            return true;
        }
      });
    }

    // Filter by selected platforms (same logic as main recommendations)
    if (preferences.platforms.length > 0 && !preferences.platforms.includes("I don't have a preference")) {
      const platformFilteredMovies = filteredMovies.filter(movie => {
        // Check if movie is available on any of the user's preferred platforms
        return movie.streaming.some((streamingService: any) => 
          preferences.platforms.includes(streamingService.service)
        );
      });
      
      // If we have movies after platform filtering, use them, otherwise keep all
      if (platformFilteredMovies.length > 0) {
        filteredMovies = platformFilteredMovies;
      }
      
      console.log('🎯 Fallback movies filtered by platforms:', filteredMovies.length);
    }

    // If no movies match, return some popular ones
    if (filteredMovies.length === 0) {
      filteredMovies = allMovies.slice(0, 6);
    }

    // Shuffle and return up to 6 movies
    const shuffled = filteredMovies.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  };

  return {
    recommendations,
    isLoading,
    isComplete,
    error,
    getRecommendations
  };
};
