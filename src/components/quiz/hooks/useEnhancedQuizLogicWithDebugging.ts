
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api-client";
import { getRecommendations } from "@/services/recommendations";
import type { EnhancedMovieRecommendation, EnhancedQuizAnswer } from "../QuizTypes";

export const useEnhancedQuizLogicWithDebugging = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<EnhancedQuizAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<EnhancedMovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({}); // For debugging
  const [region] = useState('us');
  
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = useCallback(() => {
    console.log('🎬 [Quiz] Starting quiz...');
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setRecommendations([]);
    setDebugInfo({}); // Reset debug info
  }, []);

  const parseQuizAnswersWithDebug = useCallback((quizAnswers: EnhancedQuizAnswer[]) => {
    console.log('🔍 [Parser] Starting to parse answers...');
    
    try {
      const answerMap = quizAnswers.reduce((acc, answer) => {
        console.log(`📝 [Parser] Processing: ${answer.questionId} = ${answer.answer}`);
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {} as Record<string, string>);

      console.log('🗺️ [Parser] Answer map:', answerMap);

      const filters = {
        platforms: [] as string[],
        contentType: 'notSure' as any,
        mood: 'notSure',
        genres: [] as string[],
        region: 'us',
        languages: ['en'],
        minRating: 0,
        maxResults: 20,
        includeStreamingInfo: true
      };

      // Platforms
      if (answerMap.platforms) {
        filters.platforms = answerMap.platforms.split(',').filter(p => p.trim());
        console.log('📺 [Parser] Platforms:', filters.platforms);
      }

      // Content Type
      if (answerMap.contentType) {
        filters.contentType = answerMap.contentType;
        console.log('🎬 [Parser] Content type:', filters.contentType);
      }

      // Mood
      if (answerMap.mood) {
        filters.mood = answerMap.mood;
        console.log('😊 [Parser] Mood:', filters.mood);
      }

      // Genres
      if (answerMap.preferredGenres || answerMap.genres) {
        const genreString = answerMap.preferredGenres || answerMap.genres;
        filters.genres = genreString.split(',').filter((g: string) => g.trim());
        console.log('🎭 [Parser] Genres:', filters.genres);
      }

      // Region
      if (answerMap.region) {
        if (answerMap.region.includes('Poland') || answerMap.region.includes('polska')) {
          filters.region = 'pl';
          filters.languages = ['pl', 'en'];
        } else if (answerMap.region.includes('UK')) {
          filters.region = 'gb';
        } else if (answerMap.region.includes('USA') || answerMap.region.includes('United States')) {
          filters.region = 'us';
        }
        console.log('🌍 [Parser] Region:', filters.region);
      }

      console.log('✅ [Parser] Final filters:', filters);
      return filters;

    } catch (error) {
      console.error('❌ [Parser] Error parsing answers:', error);
      throw new Error(`Failed to parse quiz answers: ${error.message}`);
    }
  }, []);

  const generateLocalFallbackRecommendations = useCallback((filters: any): EnhancedMovieRecommendation[] => {
    console.log('🏠 [Fallback] Generating local recommendations...');
    
    const popularMovies: EnhancedMovieRecommendation[] = [
      {
        id: 550,
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        backdrop_path: "",
        release_date: "1999-10-15",
        vote_average: 8.4,
        genre: "Drama",
        genres: ["Drama", "Thriller"],
        trailer_url: null,
        type: "movie" as const,
        recommendationScore: 85,
        matchReasons: ["Popular choice", "Highly rated"]
      },
      {
        id: 238,
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        backdrop_path: "",
        release_date: "1994-09-23",
        vote_average: 9.3,
        genre: "Drama",
        genres: ["Drama"],
        trailer_url: null,
        type: "movie" as const,
        recommendationScore: 95,
        matchReasons: ["Critically acclaimed", "Timeless classic"]
      },
      {
        id: 680,
        title: "Pulp Fiction",
        overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
        poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        backdrop_path: "",
        release_date: "1994-09-10",
        vote_average: 8.9,
        genre: "Crime",
        genres: ["Crime", "Drama"],
        trailer_url: null,
        type: "movie" as const,
        recommendationScore: 90,
        matchReasons: ["Cult classic", "Innovative storytelling"]
      },
      {
        id: 13,
        title: "Forrest Gump",
        overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
        poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        backdrop_path: "",
        release_date: "1994-06-23",
        vote_average: 8.5,
        genre: "Drama",
        genres: ["Drama", "Comedy"],
        trailer_url: null,
        type: "movie" as const,
        recommendationScore: 88,
        matchReasons: ["Heartwarming story", "Great performance"]
      }
    ];

    console.log(`🏠 [Fallback] Generated ${popularMovies.length} local recommendations`);
    return popularMovies;
  }, []);

  const generateEmergencyFallback = useCallback((): EnhancedMovieRecommendation[] => {
    console.log('🚨 [Emergency] Generating emergency fallback...');
    
    return [
      {
        id: 1,
        title: "Emergency Recommendation",
        overview: "If you see this, there was an issue with the recommendation system. Please try again later.",
        poster_path: "/placeholder.jpg",
        backdrop_path: "",
        release_date: "2024-01-01",
        vote_average: 5.0,
        genre: "System",
        genres: ["System"],
        trailer_url: null,
        type: "movie" as const,
        recommendationScore: 50,
        matchReasons: ["System fallback"]
      }
    ];
  }, []);

  const validateRecommendations = useCallback((recommendations: any[]): EnhancedMovieRecommendation[] => {
    console.log('🔍 [Validator] Validating recommendations...');
    
    if (!Array.isArray(recommendations)) {
      console.error('❌ [Validator] Recommendations is not an array:', typeof recommendations);
      return [];
    }

    const validRecommendations = recommendations.filter(rec => {
      // Check required fields
      const hasRequiredFields = (
        rec &&
        (rec.id || rec.tmdbId) &&
        rec.title &&
        typeof rec.vote_average === 'number'
      );

      if (!hasRequiredFields) {
        console.warn('⚠️ [Validator] Invalid recommendation:', rec);
        return false;
      }

      return true;
    }).map(rec => ({
      ...rec,
      genres: rec.genres || [rec.genre || "Unknown"],
      matchReasons: rec.matchReasons || ["Recommended for you"],
      recommendationScore: rec.recommendationScore || 50,
      type: rec.type || "movie"
    }));

    console.log(`✅ [Validator] ${validRecommendations.length}/${recommendations.length} recommendations are valid`);
    return validRecommendations;
  }, []);

  const processAnswers = useCallback(async (quizAnswers: EnhancedQuizAnswer[]) => {
    console.log('🔄 [Quiz] Processing answers:', quizAnswers);
    setIsLoading(true);
    
    try {
      // STEP 1: Check if we have answers
      if (!quizAnswers || quizAnswers.length === 0) {
        throw new Error('No quiz answers provided');
      }

      console.log('📝 [Quiz] Number of answers:', quizAnswers.length);
      
      // STEP 3: Parse answers
      const filters = parseQuizAnswersWithDebug(quizAnswers);
      console.log('🔍 [Quiz] Parsed filters:', filters);
      
      setDebugInfo(prev => ({ ...prev, filters, step: 'filters_parsed' }));

      // STEP 4: Try Enhanced Edge Function
      console.log('🚀 [Quiz] Calling enhanced edge function...');
      
      let recommendations: EnhancedMovieRecommendation[] = [];
      const apiAttempts: any[] = [];

      try {
        const data = await getRecommendations({
          filters: filters as unknown as Parameters<typeof getRecommendations>[0]["filters"],
          region: (filters as { region?: string }).region,
          maxResults: (filters as { maxResults?: number }).maxResults,
        });

        apiAttempts.push({
          type: 'worker-recommendations',
          success: Array.isArray(data) && data.length > 0,
          dataReceived: !!data,
          dataLength: Array.isArray(data) ? data.length : 0
        });

        if (data && Array.isArray(data) && data.length > 0) {
          recommendations = data as unknown as EnhancedMovieRecommendation[];
          console.log('✅ [Quiz] Worker recommendations success:', recommendations.length);
        } else {
          throw new Error('No recommendations from Worker');
        }
      } catch (recoError) {
        console.error('❌ [Quiz] Worker recommendations failed, using local fallback:', recoError);
        recommendations = generateLocalFallbackRecommendations(filters);
        apiAttempts.push({
          type: 'local-fallback',
          success: true,
          error: null,
          dataReceived: true,
          dataLength: recommendations.length
        });
      }

      // STEP 7: Validate recommendations
      const validRecommendations = validateRecommendations(recommendations);
      console.log('✅ [Quiz] Valid recommendations:', validRecommendations.length);

      if (validRecommendations.length === 0) {
        console.warn('⚠️ [Quiz] No valid recommendations found, generating emergency fallback...');
        validRecommendations.push(...generateEmergencyFallback());
      }

      // STEP 8: Save history (best-effort; Worker derives the user, no-op if anonymous)
      try {
        await api.post('/quiz/history', { answers: quizAnswers });
        console.log('💾 [Quiz] History saved');
      } catch (historyError) {
        console.error('⚠️ [Quiz] History save error:', historyError);
      }

      // STEP 9: Set results
      setAnswers(quizAnswers);
      setRecommendations(validRecommendations);
      setShowResults(true);
      setShowQuiz(false);
      setDebugInfo({
        filters,
        apiAttempts,
        finalCount: validRecommendations.length,
        timestamp: new Date().toISOString()
      });

      console.log('🎉 [Quiz] Process completed successfully!');
      
      toast({
        title: t('quiz.success.title') || 'Success!',
        description: `Found ${validRecommendations.length} recommendations`,
      });

      return validRecommendations;

    } catch (error) {
      console.error('💥 [Quiz] Critical error in processAnswers:', error);
      
      // Final fallback in case of complete failure
      const emergencyRecs = generateEmergencyFallback();
      
      setRecommendations(emergencyRecs);
      setShowResults(true);
      setShowQuiz(false);
      setDebugInfo({
        error: error.message,
        emergencyFallback: true,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: t('quiz.error.title') || 'Error occurred',
        description: `Using fallback recommendations. Error: ${error.message}`,
        variant: 'destructive'
      });

      return emergencyRecs;
    } finally {
      setIsLoading(false);
    }
  }, [region, toast, t, parseQuizAnswersWithDebug, generateLocalFallbackRecommendations, generateEmergencyFallback, validateRecommendations]);

  const handleQuizComplete = useCallback(async (quizAnswers: EnhancedQuizAnswer[]) => {
    console.log('🏁 [Quiz] Quiz completion triggered');
    try {
      const recommendations = await processAnswers(quizAnswers);
      return recommendations;
    } catch (error) {
      console.error('💥 [Quiz] Error in handleQuizComplete:', error);
      throw error;
    }
  }, [processAnswers]);

  return {
    showQuiz,
    showResults,
    answers,
    recommendations,
    isLoading,
    region,
    debugInfo, // Expose debug info
    handleStartQuiz,
    handleQuizComplete,
    processAnswers
  };
};
