import { useState } from "react";
import type { QuizAnswer, SurveyStepType, MovieRecommendation } from "../QuizTypes";
import { useQuizLogic } from "../QuizLogic";

export const useQuizState = (steps: SurveyStepType[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { recommendations, processAnswers } = useQuizLogic();
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (answer: string) => {
    if (answer === "PREV_STEP") {
      handlePrevious();
      return;
    }

    if (answer === "NEXT_STEP") {
      handleNext();
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentStep] = {
      questionId: steps[currentStep].id,
      answer,
    };
    setAnswers(newAnswers);

    if (steps[currentStep].type === "single") {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async (quizAnswers: QuizAnswer[]) => {
    try {
      await processAnswers(quizAnswers);
      setIsComplete(true);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      throw error;
    }
  };

  return {
    currentStep,
    answers,
    recommendations,
    handleAnswer,
    handleNext,
    handlePrevious,
    isComplete,
    handleFinish,
  };
};

export { useQuizLogic };
export type { MovieRecommendation };