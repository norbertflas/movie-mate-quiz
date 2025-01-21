import { useState } from "react";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { getQuizRecommendations } from "./utils/quizRecommendations";
import { saveQuizHistory } from "./utils/quizHistory";

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

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    try {
      await processAnswers(quizAnswers);
      setShowResults(true);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      toast({
        title: t("errors.recommendationError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const processAnswers = async (answers: QuizAnswer[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is authenticated, save quiz history
      if (user) {
        await saveQuizHistory(user.id, answers);
      }

      // Get recommendations regardless of authentication status
      const processedRecs = await getQuizRecommendations(user?.id);
      
      if (!processedRecs || processedRecs.length === 0) {
        throw new Error("No recommendations generated");
      }
      
      setRecommendations(processedRecs);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
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