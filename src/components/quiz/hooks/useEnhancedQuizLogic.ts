import { useState, useCallback } from "react";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook, EnhancedQuizFilters, EnhancedMovieRecommendation, StreamingAvailability } from "../QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { parseQuizAnswers, getPersonalizedRecommendations, generateFallbackRecommendations } from "../utils/quizRecommendationLogic";

export const useEnhancedQuizLogic = (): QuizLogicHook => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<EnhancedMovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState<string>('us');
  
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = useCallback(() => {
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setAnswerMap({});
    setRecommendations([]);
  }, []);

  // Wykrywanie regionu użytkownika
  const detectUserRegion = useCallback(async (): Promise<string> => {
    try {
      // Sprawdź preferencje użytkownika w localStorage
      const savedRegion = localStorage.getItem('preferred-region');
      if (savedRegion) return savedRegion;

      // Wykryj język przeglądarki
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('pl')) return 'pl';
      if (browserLang.includes('de')) return 'de';
      if (browserLang.includes('fr')) return 'fr';
      
      // Domyślnie US
      return 'us';
    } catch {
      return 'us';
    }
  }, []);

  // Parsowanie odpowiedzi z dodatkową logiką dla regionów i platform
  const parseEnhancedQuizAnswers = useCallback((quizAnswers: QuizAnswer[]): EnhancedQuizFilters => {
    const answerMap = quizAnswers.reduce((acc, answer) => {
      acc[answer.questionId] = answer.answer;
      return acc;
    }, {} as Record<string, string>);

    // Podstawowe parsowanie
    const basicFilters = parseQuizAnswers(quizAnswers);
    
    // Rozszerzone filtry
    const enhancedFilters: EnhancedQuizFilters = {
      ...basicFilters,
      region: region,
      languages: region === 'pl' ? ['pl', 'en'] : ['en'],
      includeStreamingInfo: true,
      maxResults: 20,
    };

    // Dodatkowa logika dla różnych typów pytań
    if (answerMap.movieLength) {
      switch (answerMap.movieLength) {
        case t("quiz.options.movieLength.short"):
          enhancedFilters.runtime = { max: 90 };
          break;
        case t("quiz.options.movieLength.standard"):
          enhancedFilters.runtime = { min: 90, max: 150 };
          break;
        case t("quiz.options.movieLength.long"):
          enhancedFilters.runtime = { min: 150 };
          break;
      }
    }

    // Mapowanie nastroju na gatunki
    if (answerMap.mood) {
      const moodToGenres: Record<string, string[]> = {
        [t("quiz.options.mood.laugh")]: ['Comedy', 'Family'],
        [t("quiz.options.mood.touching")]: ['Drama', 'Romance'],
        [t("quiz.options.mood.adrenaline")]: ['Action', 'Thriller', 'Adventure'],
        [t("quiz.options.mood.relax")]: ['Documentary', 'Animation', 'Family'],
      };
      
      const moodGenres = moodToGenres[answerMap.mood];
      if (moodGenres) {
        enhancedFilters.genres = [...(enhancedFilters.genres || []), ...moodGenres];
      }
    }

    // Dodaj preferencje jakości na podstawie wybranych platform premium
    const premiumPlatforms = ['Netflix', 'Disney+', 'HBO Max', 'Apple TV+'];
    const userPlatforms = enhancedFilters.platforms || [];
    const hasPremiumPlatforms = userPlatforms.some(p => premiumPlatforms.includes(p));
    
    if (hasPremiumPlatforms) {
      enhancedFilters.minRating = 6.5; // Wyższe oceny dla platform premium
    }

    return enhancedFilters;
  }, [region, t]);

  // Pobieranie dostępności streamingowej dla rekomendacji
  const enrichWithStreamingData = useCallback(async (
    recommendations: MovieRecommendation[]
  ): Promise<EnhancedMovieRecommendation[]> => {
    const enrichedRecommendations: EnhancedMovieRecommendation[] = [];

    for (const rec of recommendations) {
      try {
        // Wywołaj edge function streaming-availability
        const { data, error } = await supabase.functions.invoke('streaming-availability', {
          body: {
            tmdbId: rec.tmdbId || rec.id,
            country: region.toLowerCase(),
            title: rec.title,
            year: rec.release_date?.split('-')[0]
          }
        });

        let streamingAvailability: StreamingAvailability[] = [];
        let availableOn: string[] = [];

        if (!error && data?.result) {
          streamingAvailability = data.result;
          availableOn = streamingAvailability.map(s => s.service);
        }

        // Oblicz wynik dopasowania na podstawie dostępności
        let recommendationScore = rec.vote_average * 10; // Bazowy wynik
        
        // Bonus za dostępność na preferowanych platformach użytkownika
        const userPlatforms = answerMap.platforms?.split(',') || [];
        const matchingPlatforms = availableOn.filter(platform => 
          userPlatforms.some(userPlatform => 
            platform.toLowerCase().includes(userPlatform.toLowerCase())
          )
        );
        
        recommendationScore += matchingPlatforms.length * 15;

        // Przygotuj powody rekomendacji
        const matchReasons: string[] = [];
        if (matchingPlatforms.length > 0) {
          matchReasons.push(`Available on ${matchingPlatforms.join(', ')}`);
        }
        if (rec.vote_average >= 7.5) {
          matchReasons.push('Highly rated');
        }

        enrichedRecommendations.push({
          ...rec,
          streamingAvailability,
          availableOn,
          recommendationScore,
          matchReasons,
          alternativeRegions: streamingAvailability.length === 0 ? ['us', 'gb'] : undefined
        });

      } catch (error) {
        console.error(`Error enriching recommendation ${rec.id}:`, error);
        // Dodaj bez informacji o streamingu
        enrichedRecommendations.push({
          ...rec,
          streamingAvailability: [],
          availableOn: [],
          recommendationScore: rec.vote_average * 10,
          matchReasons: []
        });
      }
    }

    // Sortuj według wyniku dopasowania
    return enrichedRecommendations.sort((a, b) => 
      (b.recommendationScore || 0) - (a.recommendationScore || 0)
    );
  }, [region, answerMap]);

  // Główna funkcja przetwarzania odpowiedzi
  const processAnswers = useCallback(async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    setIsLoading(true);
    
    try {
      console.log('Processing enhanced quiz answers:', quizAnswers);
      
      // Wykryj region użytkownika
      const detectedRegion = await detectUserRegion();
      setRegion(detectedRegion);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Zapisz historię quizu
      if (user) {
        const { error: historyError } = await supabase
          .from('quiz_history')
          .insert([{ 
            user_id: user.id, 
            answers: quizAnswers
          }]);
        
        if (historyError) {
          console.error('Error saving quiz history:', historyError);
        }
      }

      // Parsuj odpowiedzi do rozszerzonych filtrów
      const enhancedFilters = parseEnhancedQuizAnswers(quizAnswers);
      console.log('Enhanced filters:', enhancedFilters);

      // Update answer map for UI consistency
      const newAnswerMap = quizAnswers.reduce((map, answer) => {
        map[answer.questionId] = answer.answer;
        return map;
      }, {} as Record<string, string>);
      setAnswerMap(newAnswerMap);

      let baseRecommendations: MovieRecommendation[] = [];

      try {
        // Spróbuj pobrać spersonalizowane rekomendacje
        baseRecommendations = await getPersonalizedRecommendations(enhancedFilters);
        
      } catch (edgeFunctionError) {
        console.error('Enhanced recommendations failed, using fallback:', edgeFunctionError);
        baseRecommendations = generateFallbackRecommendations(enhancedFilters);
      }

      // Wzbogać rekomendacje o dane streamingowe
      const enrichedRecommendations = await enrichWithStreamingData(baseRecommendations);
      
      // Filtruj rekomendacje dostępne na platformach użytkownika
      const userPlatforms = enhancedFilters.platforms || [];
      const availableRecommendations = enrichedRecommendations.filter(rec => 
        rec.availableOn?.some(platform => 
          userPlatforms.some(userPlatform => 
            platform.toLowerCase().includes(userPlatform.toLowerCase())
          )
        ) || rec.availableOn?.length === 0 // Zachowaj też te bez informacji o streamingu
      );

      // Jeśli za mało dostępnych, dodaj najlepsze ogólne
      const finalRecommendations = availableRecommendations.length >= 5 
        ? availableRecommendations.slice(0, 12)
        : [
            ...availableRecommendations,
            ...enrichedRecommendations
              .filter(rec => !availableRecommendations.includes(rec))
              .slice(0, 12 - availableRecommendations.length)
          ];

      setAnswers(quizAnswers);
      setRecommendations(finalRecommendations);
      setShowResults(true);
      
      // Wyświetl toast z informacją o regionie - fix the translation call
      toast({
        title: t('quiz.success.title') || 'Quiz completed!',
        description: t('quiz.success.regionDetected', { region: detectedRegion.toUpperCase() }) || `Recommendations for ${detectedRegion.toUpperCase()}`,
      });

      return finalRecommendations;

    } catch (error) {
      console.error('Error processing enhanced quiz answers:', error);
      
      // Ostateczny fallback
      const basicFilters = parseQuizAnswers(quizAnswers);
      const fallbackRecommendations = generateFallbackRecommendations(basicFilters);
      
      setRecommendations(fallbackRecommendations.map(rec => ({
        ...rec,
        streamingAvailability: [],
        availableOn: [],
        recommendationScore: rec.vote_average * 10,
        matchReasons: []
      })));
      setShowResults(true);
      
      toast({
        title: t('quiz.error.title') || 'Error',
        description: t('quiz.error.fallback') || 'Using fallback recommendations',
        variant: 'destructive'
      });

      return fallbackRecommendations;
    } finally {
      setIsLoading(false);
    }
  }, [detectUserRegion, parseEnhancedQuizAnswers, enrichWithStreamingData, toast, t]);

  const handleQuizComplete = useCallback(async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    try {
      const recommendations = await processAnswers(quizAnswers);
      return recommendations;
    } catch (error) {
      console.error('Error completing enhanced quiz:', error);
      throw error;
    }
  }, [processAnswers]);

  // Funkcja do zmiany regionu
  const changeRegion = useCallback((newRegion: string) => {
    setRegion(newRegion);
    localStorage.setItem('preferred-region', newRegion);
    
    // Jeśli są już wyniki, odśwież je dla nowego regionu
    if (recommendations.length > 0) {
      processAnswers(answers);
    }
  }, [recommendations, answers, processAnswers]);

  return {
    showQuiz,
    showResults,
    answers,
    answerMap,
    recommendations: recommendations as MovieRecommendation[], // Type compatibility
    isLoading,
    region,
    handleStartQuiz,
    handleQuizComplete,
    processAnswers,
    changeRegion
  };
};
