import { useState } from "react";
import { useQuizLogic } from "../QuizLogic";
import type { QuizAnswer, MovieRecommendation } from "../QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useQuizState = (steps: any[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { recommendations, processAnswers } = useQuizLogic();
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

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
      await processAnswers(quizAnswers);
      setIsComplete(true);
      
      if (!recommendations || recommendations.length === 0) {
        throw new Error("No recommendations generated");
      }
      
      toast({
        title: t("quiz.completed"),
        description: t("quiz.recommendationsReady"),
      });
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      throw error;
    }
  };

  return {
    currentStep,
    answers,
    isComplete,
    recommendations,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleFinish
  };
};