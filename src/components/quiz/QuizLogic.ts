import { useState } from "react";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export const useQuizLogic = (): QuizLogicHook => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setRecommendations([]);
  };

  const processAnswers = async (quizAnswers: QuizAnswer[]) => {
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

      // Get recommendations from Edge Function
      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: { 
          answers: quizAnswers,
          userId: user?.id,
          includeExplanations: true
        }
      });

      if (error) {
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response from recommendations service');
      }

      console.log('Received recommendations:', data);
      setAnswers(quizAnswers);
      setRecommendations(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      throw error;
    }
  };

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]) => {
    try {
      await processAnswers(quizAnswers);
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  };

  return {
    showQuiz,
    showResults,
    answers,
    recommendations,
    handleStartQuiz,
    handleQuizComplete,
    processAnswers
  };
};