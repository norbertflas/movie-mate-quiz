
import { useState, useCallback } from "react";
import type { QuizAnswer, MovieRecommendation } from "../QuizTypes";
import type { EnhancedQuizFilters, EnhancedMovieRecommendation } from "../types/EnhancedQuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export const useOptimizedQuizLogic = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = useCallback(() => {
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setRecommendations([]);
  }, []);

  const processAnswers = useCallback(async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    setIsLoading(true);
    
    try {
      console.log('Processing optimized quiz answers:', quizAnswers);
      
      // Prosty fallback dla rekomendacji
      const fallbackRecommendations: MovieRecommendation[] = [
        {
          id: 550,
          title: "Fight Club",
          overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
          poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          release_date: "1999-10-15",
          vote_average: 8.4,
          genre: "Drama",
          trailer_url: null,
          explanations: ["Highly rated choice"]
        },
        {
          id: 13,
          title: "Forrest Gump",
          overview: "The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.",
          poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
          release_date: "1994-07-06",
          vote_average: 8.5,
          genre: "Drama",
          trailer_url: null,
          explanations: ["Popular classic"]
        }
      ];

      setAnswers(quizAnswers);
      setRecommendations(fallbackRecommendations);
      setShowResults(true);
      
      return fallbackRecommendations;
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQuizComplete = useCallback(async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    try {
      const recommendations = await processAnswers(quizAnswers);
      return recommendations;
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  }, [processAnswers]);

  return {
    showQuiz,
    showResults,
    answers,
    recommendations,
    isLoading,
    handleStartQuiz,
    handleQuizComplete,
    processAnswers
  };
};
