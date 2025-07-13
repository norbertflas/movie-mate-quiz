
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedMovieRecommendation, EnhancedQuizAnswer, EnhancedQuizFilters } from '../QuizTypes';
import { detectUserRegion } from '../QuizTypes';

export const useEnhancedQuizLogic = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<EnhancedMovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState(detectUserRegion());

  const handleStartQuiz = useCallback(() => {
    setShowQuiz(true);
    setShowResults(false);
    setRecommendations([]);
  }, []);

  const changeRegion = useCallback((newRegion: string) => {
    setRegion(newRegion.toUpperCase());
    localStorage.setItem('preferred-region', newRegion.toUpperCase());
  }, []);

  const parseQuizAnswers = (answers: EnhancedQuizAnswer[]): EnhancedQuizFilters => {
    const answerMap = answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer.answer;
      return acc;
    }, {} as Record<string, string>);

    const filters: EnhancedQuizFilters = {
      platforms: answerMap.platforms?.split(',') || [],
      contentType: answerMap.contentType as any || 'notSure',
      mood: answerMap.mood || 'notSure',
      genres: answerMap.preferredGenres?.split(',') || [],
      region: region,
      languages: ['en'],
      minRating: 0,
      maxResults: 20,
      includeStreamingInfo: true
    };

    // Region detection from answers
    if (answerMap.region?.includes('Poland') || answerMap.region?.includes('polska')) {
      filters.region = 'PL';
      filters.languages = ['pl', 'en'];
    } else if (answerMap.region?.includes('USA')) {
      filters.region = 'US';
    } else if (answerMap.region?.includes('UK')) {
      filters.region = 'GB';
    }

    // Mood to genres mapping
    const moodToGenres: Record<string, string[]> = {
      'laugh': ['Comedy', 'Family', 'Animation'],
      'touching': ['Drama', 'Romance', 'Family'],
      'adrenaline': ['Action', 'Thriller', 'Adventure'],
      'relax': ['Documentary', 'Animation', 'Family'],
      'think': ['Drama', 'Documentary', 'Mystery'],
      'escape': ['Fantasy', 'Science Fiction', 'Adventure']
    };

    if (answerMap.mood && moodToGenres[answerMap.mood]) {
      filters.genres = [...filters.genres, ...moodToGenres[answerMap.mood]];
    }

    // Release year filtering
    const currentYear = new Date().getFullYear();
    if (answerMap.releaseYear?.includes('Latest') || answerMap.releaseYear?.includes('Najnowsze')) {
      filters.releaseYear = { min: currentYear - 1 };
    } else if (answerMap.releaseYear?.includes('Recent') || answerMap.releaseYear?.includes('Ostatnie')) {
      filters.releaseYear = { min: currentYear - 5 };
    } else if (answerMap.releaseYear?.includes('Modern') || answerMap.releaseYear?.includes('Nowoczesne')) {
      filters.releaseYear = { min: 2000, max: 2020 };
    } else if (answerMap.releaseYear?.includes('Vintage') || answerMap.releaseYear?.includes('przed')) {
      filters.releaseYear = { max: 1979 };
    }

    // Movie length filtering
    if (answerMap.movieLength?.includes('Short') || answerMap.movieLength?.includes('Krótki')) {
      filters.runtime = { max: 90 };
    } else if (answerMap.movieLength?.includes('Standard') || answerMap.movieLength?.includes('Standardowy')) {
      filters.runtime = { min: 90, max: 150 };
    } else if (answerMap.movieLength?.includes('Long') || answerMap.movieLength?.includes('Długi')) {
      filters.runtime = { min: 150 };
    }

    // Quality preference
    if (answerMap.qualityPreference?.includes('highly rated') || answerMap.qualityPreference?.includes('wysoko')) {
      filters.minRating = 7.5;
    } else if (answerMap.qualityPreference?.includes('Mix') || answerMap.qualityPreference?.includes('mix')) {
      filters.minRating = 6.0;
    } else if (answerMap.qualityPreference?.includes('Hidden') || answerMap.qualityPreference?.includes('Ukryte')) {
      filters.minRating = 6.5;
      filters.maxResults = 30;
    }

    return filters;
  };

  const enrichWithStreamingData = async (
    recommendations: EnhancedMovieRecommendation[],
    region: string
  ): Promise<EnhancedMovieRecommendation[]> => {
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (movie) => {
        try {
          const { data } = await supabase.functions.invoke('get-streaming-availability', {
            body: {
              tmdbId: movie.tmdbId || movie.id,
              country: region.toLowerCase(),
              title: movie.title,
              year: new Date(movie.release_date).getFullYear()
            }
          });

          if (data?.result && Array.isArray(data.result)) {
            return {
              ...movie,
              streamingAvailability: data.result,
              availableOn: data.result.map((service: any) => service.service),
              primaryPlatform: data.result[0]?.service
            };
          }
        } catch (error) {
          console.error(`Failed to get streaming data for ${movie.title}:`, error);
        }

        return movie;
      })
    );

    return enrichedRecommendations;
  };

  const handleQuizComplete = useCallback(async (answers: EnhancedQuizAnswer[]): Promise<EnhancedMovieRecommendation[]> => {
    setIsLoading(true);
    
    try {
      const filters = parseQuizAnswers(answers);
      
      // Get recommendations from edge function
      const { data, error } = await supabase.functions.invoke('get-enhanced-recommendations', {
        body: {
          answers: answers,
          region: filters.region,
          includeStreaming: true,
          maxResults: filters.maxResults
        }
      });

      if (error) throw error;

      let recommendations: EnhancedMovieRecommendation[] = data || [];

      // Enrich with streaming availability
      if (recommendations.length > 0) {
        recommendations = await enrichWithStreamingData(recommendations, filters.region);
      }

      // Add match reasons and scoring
      recommendations = recommendations.map((movie, index) => ({
        ...movie,
        recommendationScore: movie.recommendationScore || (90 - index * 5),
        matchReasons: movie.matchReasons || [
          'Matches your preferred genres',
          'Available on your platforms',
          'Fits your mood'
        ].slice(0, 2)
      }));

      setRecommendations(recommendations);
      setShowResults(true);
      setShowQuiz(false);
      
      return recommendations;
    } catch (error) {
      console.error('Enhanced quiz completion error:', error);
      
      // Fallback recommendations
      const fallbackRecommendations: EnhancedMovieRecommendation[] = [
        {
          id: 550,
          title: "Fight Club",
          overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
          poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          release_date: "1999-10-15",
          vote_average: 8.4,
          genre: "Drama",
          genres: ["Drama", "Thriller"],
          trailer_url: null,
          type: "movie",
          recommendationScore: 85,
          matchReasons: ["Highly rated", "Popular choice"]
        }
      ];
      
      setRecommendations(fallbackRecommendations);
      setShowResults(true);
      setShowQuiz(false);
      
      return fallbackRecommendations;
    } finally {
      setIsLoading(false);
    }
  }, [region]);

  return {
    showQuiz,
    showResults,
    recommendations,
    isLoading,
    region,
    handleStartQuiz,
    changeRegion,
    handleQuizComplete
  };
};
