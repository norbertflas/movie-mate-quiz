import { useState } from "react";
import { useQuizLogic } from "../QuizLogic";
import type { QuizAnswer, MovieRecommendation, SurveyStepType } from "../QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useQuizState = (steps: SurveyStepType[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { processAnswers } = useQuizLogic();

  const handleAnswer = (answer: string) => {
    const currentQuestion = steps[currentStep];
    if (!currentQuestion || !currentQuestion.id) {
      console.error('Invalid question at step:', currentStep);
      return;
    }

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer
    };

    setAnswers(prev => {
      const updated = [...prev];
      updated[currentStep] = newAnswer;
      console.log('Updated answers:', updated);
      return updated;
    });
  };

  const handleNext = () => {
    if (!answers[currentStep]) {
      toast({
        title: t("errors.missingAnswer"),
        description: t("errors.pleaseSelectOption"),
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async (results: MovieRecommendation[]) => {
    console.log('Setting recommendations:', results);
    setRecommendations(results);
    setIsComplete(true);
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