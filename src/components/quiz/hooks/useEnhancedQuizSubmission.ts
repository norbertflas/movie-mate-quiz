
import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { getRecommendations } from "@/services/recommendations";
import { getStreamingAvailabilityBatch, type MovieStreamingData } from "@/services/streamingAvailabilityPro";
import type {
  EnhancedQuizAnswer,
  EnhancedMovieRecommendation,
  EnhancedQuizFilters,
  StreamingAvailability
} from "../QuizTypes";

const toQuizStreamingAvailability = (
  data: MovieStreamingData | undefined,
  region: string
): StreamingAvailability[] => {
  if (!data) return [];
  return data.streamingOptions.map(option => ({
    service: option.service,
    link: option.link,
    available: true,
    type: option.type,
    price: option.price?.formatted,
    quality: 'hd' as const,
    region,
    source: 'streaming-availability' as const
  }));
};

interface QuizAnalytics {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  completionRate: number;
  answers: EnhancedQuizAnswer[];
  recommendations?: {
    total: number;
    withStreaming: number;
    avgRating: number;
    topGenres: string[];
  };
  performance?: {
    totalTime: number;
    avgQuestionTime: number;
    apiCalls: number;
    errors: string[];
  };
}

interface UseEnhancedQuizSubmissionProps {
  steps: any[];
  region: string;
  onFinish: (data: EnhancedMovieRecommendation[]) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

// Simple scoring function for backwards compatibility
const calculateRecommendationScore = (
  movie: EnhancedMovieRecommendation,
  filters: EnhancedQuizFilters,
  userPlatforms: string[]
): number => {
  let score = movie.vote_average * 10; // Base score from rating
  
  // Bonus for platform availability
  if (movie.availableOn) {
    const matchingPlatforms = movie.availableOn.filter(platform =>
      userPlatforms.some(userPlatform =>
        platform.toLowerCase().includes(userPlatform.toLowerCase())
      )
    );
    score += matchingPlatforms.length * 15;
  }
  
  return Math.min(score, 100);
};

export const useEnhancedQuizSubmission = ({
  steps,
  region,
  onFinish,
  onError,
  onProgress
}: UseEnhancedQuizSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState<Partial<QuizAnalytics>>({});
  const [sessionId] = useState(() => `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const startTimeRef = useRef<number>(Date.now());
  const apiCallsRef = useRef<number>(0);
  const errorsRef = useRef<string[]>([]);

  // Event tracking function
  const trackEvent = useCallback((event: string, data?: any) => {
    console.log(`[Quiz Analytics] ${event}:`, data);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        quiz_session_id: sessionId,
        region: region,
        ...data
      });
    }
  }, [sessionId, region]);

  // Enrich recommendations with streaming data
  const enrichRecommendationsWithStreaming = useCallback(async (
    recommendations: EnhancedMovieRecommendation[],
    userPlatforms: string[]
  ): Promise<EnhancedMovieRecommendation[]> => {
    const enriched: EnhancedMovieRecommendation[] = [];

    onProgress?.(10);

    // Single batch request for all recommendations (cached client- and server-side)
    let streamingByMovie = new Map<number, MovieStreamingData>();
    try {
      const batchResults = await getStreamingAvailabilityBatch(
        recommendations.map(rec => rec.tmdbId || rec.id),
        'instant',
        region.toLowerCase()
      );
      apiCallsRef.current++;
      streamingByMovie = new Map(batchResults.map(result => [result.tmdbId, result]));
    } catch (error) {
      errorsRef.current.push(`Streaming batch error: ${error.message}`);
    }

    onProgress?.(50);

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];

      try {
        onProgress?.(50 + (i / recommendations.length) * 20);

        const movieStreaming = streamingByMovie.get(rec.tmdbId || rec.id);
        const streamingAvailability = toQuizStreamingAvailability(movieStreaming, region);
        // "Available on" means subscription/free — rent/buy offers stay in streamingAvailability
        const availableOn = movieStreaming?.availableServices || [];

        if (availableOn.length > 0) {
          trackEvent('streaming_data_fetched', {
            tmdb_id: rec.tmdbId || rec.id,
            services_found: availableOn.length,
            region: region
          });
        }

        const baseFilters: EnhancedQuizFilters = {
          platforms: userPlatforms,
          contentType: 'notSure',
          mood: '',
          genres: [],
          region: region,
          languages: [],
          includeStreamingInfo: true
        };

        const recommendationScore = calculateRecommendationScore(
          { ...rec, streamingAvailability, availableOn },
          baseFilters,
          userPlatforms
        );

        const matchReasons: string[] = [];
        
        if (availableOn.length > 0) {
          const userPlatformMatches = availableOn.filter(platform =>
            userPlatforms.some(userPlatform =>
              platform.toLowerCase().includes(userPlatform.toLowerCase())
            )
          );
          
          if (userPlatformMatches.length > 0) {
            matchReasons.push(`Available on ${userPlatformMatches.join(', ')}`);
          } else {
            matchReasons.push(`Available on ${availableOn.slice(0, 2).join(', ')}`);
          }
        }

        if (rec.vote_average >= 8.0) {
          matchReasons.push('Highly rated');
        } else if (rec.vote_average >= 7.0) {
          matchReasons.push('Well rated');
        }

        const releaseYear = new Date(rec.release_date).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - releaseYear <= 2) {
          matchReasons.push('Recent release');
        }

        let popularityTrend: 'rising' | 'stable' | 'declining' = 'stable';
        if (rec.vote_count && rec.vote_count > 1000) {
          popularityTrend = releaseYear >= currentYear - 1 ? 'rising' : 'stable';
        }

        enriched.push({
          ...rec,
          streamingAvailability,
          availableOn,
          recommendationScore,
          matchReasons,
          popularityTrend,
          primaryPlatform: availableOn[0] || undefined,
          alternativeRegions: streamingAvailability.length === 0 ? ['us', 'gb'] : undefined
        });

      } catch (error) {
        errorsRef.current.push(`Error enriching ${rec.title}: ${error.message}`);
        console.error(`Error enriching recommendation ${rec.id}:`, error);
        
        enriched.push({
          ...rec,
          streamingAvailability: [],
          availableOn: [],
          recommendationScore: rec.vote_average * 10,
          matchReasons: ['Based on ratings'],
          popularityTrend: 'stable'
        });
      }
    }

    return enriched.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
  }, [region, onProgress, trackEvent]);

  // Main submission function
  const submitQuiz = useCallback(async (answers: EnhancedQuizAnswer[]): Promise<EnhancedMovieRecommendation[]> => {
    setIsSubmitting(true);
    startTimeRef.current = Date.now();
    
    try {
      trackEvent('quiz_submission_started', {
        total_answers: answers.length,
        session_id: sessionId
      });

      console.log('Submitting enhanced quiz answers:', answers);
      onProgress?.(5);

      const platformsAnswer = answers.find(a => a.questionId === 'platforms');
      const userPlatforms = platformsAnswer?.answer?.split(',') || [];

      const data = await getRecommendations({
        answers: answers as { questionId: string; answer: string | string[] }[],
        region,
        maxResults: 20,
      });

      apiCallsRef.current++;
      onProgress?.(70);

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid response format from recommendations service');
      }

      console.log('Received recommendations:', data.length);
      onProgress?.(80);

      let recommendations = data as unknown as EnhancedMovieRecommendation[];

      // Enrich with streaming data if needed
      const needsStreamingData = recommendations.some(rec => !rec.streamingAvailability?.length);
      
      if (needsStreamingData) {
        trackEvent('enriching_streaming_data', {
          total_recommendations: recommendations.length
        });
        
        recommendations = await enrichRecommendationsWithStreaming(recommendations, userPlatforms);
      }

      onProgress?.(90);

      const filteredRecommendations = recommendations
        .filter(rec => rec.recommendationScore && rec.recommendationScore > 30)
        .slice(0, 12);

      // Save quiz history (best-effort; Worker derives the user, no-op if not logged in)
      const answersForDb = answers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer,
        confidence: answer.confidence || 0.8,
        metadata: answer.metadata || {}
      }));
      try {
        await api.post('/quiz/history', { answers: answersForDb });
      } catch (historyError) {
        console.error('Error saving quiz history:', historyError);
      }

      const endTime = Date.now();
      setAnalytics({
        sessionId,
        startTime: new Date(startTimeRef.current).toISOString(),
        endTime: new Date(endTime).toISOString(),
        completionRate: 1.0,
        answers,
        recommendations: {
          total: filteredRecommendations.length,
          withStreaming: filteredRecommendations.filter(r => r.streamingAvailability?.length).length,
          avgRating: filteredRecommendations.reduce((sum, r) => sum + r.vote_average, 0) / filteredRecommendations.length,
          topGenres: [...new Set(filteredRecommendations.flatMap(r => r.genres || []))].slice(0, 5)
        },
        performance: {
          totalTime: endTime - startTimeRef.current,
          avgQuestionTime: (endTime - startTimeRef.current) / answers.length,
          apiCalls: apiCallsRef.current,
          errors: errorsRef.current
        }
      });

      onProgress?.(100);

      trackEvent('quiz_submission_completed', {
        recommendations_count: filteredRecommendations.length,
        with_streaming: filteredRecommendations.filter(r => r.streamingAvailability?.length).length,
        avg_score: filteredRecommendations.reduce((sum, r) => sum + (r.recommendationScore || 0), 0) / filteredRecommendations.length,
        total_time: Date.now() - startTimeRef.current
      });

      return filteredRecommendations;

    } catch (error) {
      console.error('Error submitting enhanced quiz:', error);
      errorsRef.current.push(`Submission error: ${error.message}`);
      
      trackEvent('quiz_submission_error', {
        error_message: error.message,
        api_calls: apiCallsRef.current,
        errors: errorsRef.current
      });

      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, region, onProgress, onError, trackEvent, enrichRecommendationsWithStreaming]);

  const checkAlternativeRegions = useCallback(async (
    recommendations: EnhancedMovieRecommendation[],
    alternativeRegion: string
  ): Promise<EnhancedMovieRecommendation[]> => {
    const missing = recommendations.filter(rec => rec.streamingAvailability?.length === 0);
    if (missing.length === 0) return recommendations;

    let streamingByMovie = new Map<number, MovieStreamingData>();
    try {
      const batchResults = await getStreamingAvailabilityBatch(
        missing.map(rec => rec.tmdbId || rec.id),
        'lazy',
        alternativeRegion.toLowerCase()
      );
      streamingByMovie = new Map(batchResults.map(result => [result.tmdbId, result]));
    } catch (error) {
      console.error(`Error checking alternative region ${alternativeRegion}:`, error);
      return recommendations;
    }

    return recommendations.map(rec => {
      if (rec.streamingAvailability?.length !== 0) return rec;

      const movieStreaming = streamingByMovie.get(rec.tmdbId || rec.id);
      if (!movieStreaming || movieStreaming.streamingOptions.length === 0) return rec;

      return {
        ...rec,
        alternativeRegions: [alternativeRegion],
        streamingAvailability: toQuizStreamingAvailability(movieStreaming, alternativeRegion)
      };
    });
  }, []);

  const submitFeedback = useCallback(async (
    rating: number,
    comment?: string,
    recommendationIds?: number[]
  ): Promise<void> => {
    try {
      // No feedback table; log + analytics event for now.
      console.log('Quiz Feedback:', {
        session_id: sessionId,
        rating,
        comment,
        recommendation_ids: recommendationIds
      });

      trackEvent('feedback_submitted', {
        rating,
        has_comment: !!comment,
        recommendations_rated: recommendationIds?.length || 0
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }, [sessionId, trackEvent]);

  return {
    isSubmitting,
    submitQuiz,
    analytics,
    sessionId,
    checkAlternativeRegions,
    submitFeedback,
    trackEvent
  };
};
