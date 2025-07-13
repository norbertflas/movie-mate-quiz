
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { StreamingPlatformData } from '@/types/streaming';

interface QuizStreamingSearchOptions {
  country?: string;
  maxResults?: number;
  prioritizeSubscription?: boolean;
}

interface StreamingSearchResult {
  tmdbId: number;
  title: string;
  year?: number;
  poster_path?: string;
  streamingData: StreamingPlatformData[];
  hasPreferredService: boolean;
  score: number;
}

export function useQuizStreamingSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<StreamingSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchMoviesWithStreaming = useCallback(async (
    movieIds: number[],
    userPreferences: {
      platforms?: string[];
      genres?: string[];
      mood?: string;
    },
    options: QuizStreamingSearchOptions = {}
  ) => {
    const {
      country = 'pl',
      maxResults = 20,
      prioritizeSubscription = true
    } = options;

    setIsSearching(true);
    setError(null);

    try {
      console.log(`🔍 Quiz streaming search for ${movieIds.length} movies`);

      // Call Supabase Edge Function for batch streaming lookup
      const { data: streamingResponse, error: streamingError } = await supabase.functions.invoke(
        'streaming-availability',
        {
          body: {
            tmdbIds: movieIds,
            country: country.toLowerCase(),
            mode: 'quiz'
          }
        }
      );

      if (streamingError) {
        throw new Error(`Streaming lookup failed: ${streamingError.message}`);
      }

      // Process results with scoring
      const scoredResults: StreamingSearchResult[] = [];

      if (streamingResponse?.results) {
        for (const result of streamingResponse.results) {
          let score = 0;
          let hasPreferredService = false;

          // Score based on streaming availability
          const streamingData: StreamingPlatformData[] = result.data?.streamingOptions?.map((option: any) => ({
            service: option.service,
            available: true,
            link: option.link || '#',
            type: option.type || 'subscription',
            source: 'streaming-availability-api',
            quality: option.quality || 'hd',
            price: option.price?.amount || 0,
            logo: `/streaming-icons/${option.service?.toLowerCase()?.replace(/\s+/g, '') || 'unknown'}.svg`
          })) || [];

          // Base score for having any streaming
          if (streamingData.length > 0) {
            score += 10;
          }

          // Bonus for subscription services
          const subscriptionServices = streamingData.filter(s => s.type === 'subscription');
          score += subscriptionServices.length * 5;

          // Check if movie is on user's preferred platforms
          if (userPreferences.platforms && userPreferences.platforms.length > 0) {
            const userServices = userPreferences.platforms.map(p => p.toLowerCase());
            const movieServices = streamingData.map(s => s.service.toLowerCase());
            
            const matchingServices = movieServices.filter(service => 
              userServices.some(userService => 
                service.includes(userService) || userService.includes(service)
              )
            );

            if (matchingServices.length > 0) {
              hasPreferredService = true;
              score += matchingServices.length * 15; // High bonus for preferred platforms
            }
          }

          // Genre matching bonus
          if (userPreferences.genres && result.data?.genres) {
            const genreMatches = userPreferences.genres.filter(userGenre =>
              result.data.genres.some((movieGenre: string) => 
                movieGenre.toLowerCase().includes(userGenre.toLowerCase())
              )
            );
            score += genreMatches.length * 3;
          }

          // Mood-based scoring
          if (userPreferences.mood) {
            const moodGenreMap: Record<string, string[]> = {
              funny: ['comedy', 'animation'],
              touching: ['drama', 'romance'],
              adrenaline: ['action', 'thriller', 'adventure'],
              relaxing: ['documentary', 'family']
            };

            const moodGenres = moodGenreMap[userPreferences.mood] || [];
            if (result.data?.genres) {
              const moodMatches = moodGenres.filter(moodGenre =>
                result.data.genres.some((movieGenre: string) => 
                  movieGenre.toLowerCase().includes(moodGenre)
                )
              );
              score += moodMatches.length * 4;
            }
          }

          // Rating bonus
          if (result.data?.rating && result.data.rating > 70) {
            score += Math.floor((result.data.rating - 70) / 5);
          }

          scoredResults.push({
            tmdbId: result.tmdbId,
            title: result.data?.title || `Movie ${result.tmdbId}`,
            year: result.data?.year,
            poster_path: result.data?.posterUrl,
            streamingData,
            hasPreferredService,
            score
          });
        }
      }

      // Sort by score (highest first) and limit results
      const sortedResults = scoredResults
        .sort((a, b) => {
          // First prioritize movies on preferred platforms
          if (a.hasPreferredService && !b.hasPreferredService) return -1;
          if (!a.hasPreferredService && b.hasPreferredService) return 1;
          
          // Then by score
          return b.score - a.score;
        })
        .slice(0, maxResults);

      console.log(`✅ Quiz search completed: ${sortedResults.length} results`);
      console.log(`📊 Results with preferred services: ${sortedResults.filter(r => r.hasPreferredService).length}`);

      setResults(sortedResults);
      return sortedResults;

    } catch (error: any) {
      console.error('Quiz streaming search error:', error);
      setError(error.message || 'Search failed');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getTopRecommendations = useCallback((count: number = 10) => {
    return results
      .filter(r => r.streamingData.length > 0)
      .slice(0, count);
  }, [results]);

  const getMoviesOnPlatform = useCallback((platform: string) => {
    return results.filter(result => 
      result.streamingData.some(service => 
        service.service.toLowerCase().includes(platform.toLowerCase())
      )
    );
  }, [results]);

  return {
    isSearching,
    results,
    error,
    searchMoviesWithStreaming,
    getTopRecommendations,
    getMoviesOnPlatform,
    hasResults: results.length > 0,
    totalWithStreaming: results.filter(r => r.streamingData.length > 0).length,
    clearResults: () => {
      setResults([]);
      setError(null);
    }
  };
}
