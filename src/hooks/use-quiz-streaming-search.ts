
import { useState, useCallback } from 'react';
import type { StreamingPlatformData } from '@/types/streaming';
import { getStreamingAvailabilityBatch, getUserCountry } from '@/services/streamingAvailabilityPro';

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
      country = getUserCountry(),
      maxResults = 20
    } = options;

    setIsSearching(true);
    setError(null);

    try {
      console.log(`🔍 Quiz streaming search for ${movieIds.length} movies`);

      const batchResults = await getStreamingAvailabilityBatch(movieIds, 'instant', country.toLowerCase());

      const scoredResults: StreamingSearchResult[] = batchResults.map(result => {
        let score = 0;
        let hasPreferredService = false;

        const streamingData: StreamingPlatformData[] = result.streamingOptions.map(option => ({
          service: option.service,
          available: true,
          link: option.link,
          type: option.type,
          source: 'streaming-availability-pro',
          quality: option.quality,
          price: option.price?.amount,
          logo: option.serviceLogo
        }));

        // Base score for having any subscription/free streaming
        if (result.hasStreaming) {
          score += 10;
        }

        // Bonus for subscription services
        score += result.availableServices.length * 5;

        // Check if movie is on user's preferred platforms (subscription/free only)
        if (userPreferences.platforms && userPreferences.platforms.length > 0) {
          const userServices = userPreferences.platforms.map(p => p.toLowerCase());
          const movieServices = result.availableServices.map(s => s.toLowerCase());

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

        return {
          tmdbId: result.tmdbId,
          title: result.title || `Movie ${result.tmdbId}`,
          streamingData,
          hasPreferredService,
          score
        };
      });

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
