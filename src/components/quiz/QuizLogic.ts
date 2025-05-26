import { useState } from "react";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { parseQuizAnswers, getPersonalizedRecommendations, generateFallbackRecommendations } from "./utils/quizRecommendationLogic";

export const useQuizLogic = (): QuizLogicHook => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setAnswerMap({});
    setRecommendations([]);
  };

  const processAnswers = async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    setIsLoading(true);
    
    try {
      console.log('Processing quiz answers:', quizAnswers);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save quiz history if user is authenticated
      if (user) {
        const { error: historyError } = await supabase
          .from('quiz_history')
          .insert([{ user_id: user.id, answers: quizAnswers }]);

        if (historyError) {
          console.error('Error saving quiz history:', historyError);
        }
      }

      // Parse the quiz answers into structured filters
      const filters = parseQuizAnswers(quizAnswers);
      console.log('Parsed filters:', filters);

      // Update answer map for UI consistency
      const answerMap = quizAnswers.reduce((map, answer) => {
        map[answer.questionId] = answer.answer;
        return map;
      }, {} as Record<string, string>);
      setAnswerMap(answerMap);

      try {
        // Try to get personalized recommendations from the edge function
        const personalizedRecommendations = await getPersonalizedRecommendations(filters);
        setAnswers(quizAnswers);
        setRecommendations(personalizedRecommendations);
        setShowResults(true);
        return personalizedRecommendations;
      } catch (edgeFunctionError) {
        console.error('Edge function failed, using fallback:', edgeFunctionError);
        
        // If edge function fails, use fallback logic
        const fallbackRecommendations = generateFallbackRecommendations(filters);
        setAnswers(quizAnswers);
        setRecommendations(fallbackRecommendations);
        setShowResults(true);
        return fallbackRecommendations;
      }
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      
      // Final fallback - use basic recommendations
      const basicFilters = parseQuizAnswers(quizAnswers);
      const fallbackRecommendations = generateFallbackRecommendations(basicFilters);
      setRecommendations(fallbackRecommendations);
      setShowResults(true);
      return fallbackRecommendations;
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    try {
      const recommendations = await processAnswers(quizAnswers);
      return recommendations;
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  };

  return {
    showQuiz,
    showResults,
    answers,
    answerMap,
    recommendations,
    isLoading,
    handleStartQuiz,
    handleQuizComplete,
    processAnswers
  };
};
