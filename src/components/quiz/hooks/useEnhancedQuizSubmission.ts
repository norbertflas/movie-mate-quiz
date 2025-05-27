
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { 
  EnhancedQuizAnswer, 
  EnhancedMovieRecommendation, 
  EnhancedQuizFilters,
  StreamingAvailability 
} from "../QuizTypes";

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

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      
      try {
        onProgress?.(10 + (i / recommendations.length) * 60);
        
        const { data, error } = await supabase.functions.invoke('streaming-availability', {
          body: {
            tmdbId: rec.tmdbId || rec.id,
            country: region.toLowerCase(),
            title: rec.title,
            year: rec.release_date?.split('-')[0]
          }
        });

        apiCallsRef.current++;

        let streamingAvailability: StreamingAvailability[] = [];
        let availableOn: string[] = [];

        if (!error && data?.result) {
          streamingAvailability = data.result;
          availableOn = streamingAvailability.map(s => s.service);
          
          trackEvent('streaming_data_fetched', {
            tmdb_id: rec.tmdbId || rec.id,
            services_found: availableOn.length,
            region: region
          });
        } else {
          if (error) {
            errorsRef.current.push(`Streaming API error for ${rec.title}: ${error.message}`);
          }
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

      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: { answers }
      });

      apiCallsRef.current++;
      onProgress?.(70);

      if (error) {
        console.error('Error from Edge Function:', error);
        throw error;
      }

      console.log('Received recommendations from Edge Function:', data);
      onProgress?.(80);

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from recommendations service');
      }

      let recommendations = data as EnhancedMovieRecommendation[];

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

      // Save quiz history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const endTime = Date.now();
        const newAnalytics: QuizAnalytics = {
          sessionId,
          userId: user.id,
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
        };

        await supabase
          .from('quiz_history')
          .insert([{
            user_id: user.id,
            answers,
            region,
            session_id: sessionId,
            analytics: newAnalytics,
            recommendations: filteredRecommendations
          }]);

        setAnalytics(newAnalytics);
      }

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
    const updatedRecommendations: EnhancedMovieRecommendation[] = [];

    for (const rec of recommendations) {
      if (rec.streamingAvailability?.length === 0) {
        try {
          const { data } = await supabase.functions.invoke('streaming-availability', {
            body: {
              tmdbId: rec.tmdbId || rec.id,
              country: alternativeRegion.toLowerCase(),
              title: rec.title,
              year: rec.release_date?.split('-')[0]
            }
          });

          if (data?.result?.length > 0) {
            updatedRecommendations.push({
              ...rec,
              alternativeRegions: [alternativeRegion],
              streamingAvailability: data.result.map(s => ({ ...s, region: alternativeRegion }))
            });
          } else {
            updatedRecommendations.push(rec);
          }
        } catch (error) {
          console.error(`Error checking alternative region ${alternativeRegion} for ${rec.title}:`, error);
          updatedRecommendations.push(rec);
        }
      } else {
        updatedRecommendations.push(rec);
      }
    }

    return updatedRecommendations;
  }, []);

  const submitFeedback = useCallback(async (
    rating: number,
    comment?: string,
    recommendationIds?: number[]
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('quiz_feedback')
          .insert([{
            user_id: user.id,
            session_id: sessionId,
            rating,
            comment,
            recommendation_ids: recommendationIds
          }]);

        trackEvent('feedback_submitted', {
          rating,
          has_comment: !!comment,
          recommendations_rated: recommendationIds?.length || 0
        });
      }
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
