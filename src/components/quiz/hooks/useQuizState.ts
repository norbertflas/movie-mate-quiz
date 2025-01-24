import { useState } from "react";
import { useQuizLogic } from "../QuizLogic";
import type { QuizAnswer, MovieRecommendation } from "../QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useQuizState = (steps: any[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { processAnswers } = useQuizLogic();

  const handleAnswer = (answer: string) => {
    const currentQuestion = steps[currentStep];
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer
    };

    setAnswers(prev => {
      const updated = [...prev];
      updated[currentStep] = newAnswer;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && answers[currentStep]) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async (quizAnswers: QuizAnswer[]) => {
    if (!quizAnswers || quizAnswers.length < steps.length) {
      toast({
        title: t("errors.incompleteQuiz"),
        description: t("errors.answerAllQuestions"),
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Processing answers in handleFinish:', quizAnswers);
      const movieRecommendations = await processAnswers(quizAnswers);
      
      if (!movieRecommendations || movieRecommendations.length === 0) {
        throw new Error("No recommendations generated");
      }

      console.log('Setting recommendations:', movieRecommendations);
      setRecommendations(movieRecommendations);
      setIsComplete(true);
      
      toast({
        title: t("quiz.completed"),
        description: t("quiz.recommendationsReady"),
      });
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      toast({
        title: t("errors.recommendationError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    currentStep,
    answers,
    recommendations,
    isComplete,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleFinish
  };
};