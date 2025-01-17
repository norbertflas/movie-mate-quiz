import { useState } from "react";
import type { QuizAnswer, SurveyStepType, MovieRecommendation } from "../QuizTypes";
import { useQuizLogic } from "../QuizLogic";

export const useQuizState = (steps: SurveyStepType[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { recommendations, processAnswers } = useQuizLogic();
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = async (answer: string) => {
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

    // Automatically move to next question for single-choice questions
    if (steps[currentStep].type === "single") {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        await processAnswers(newAnswers);
        setIsComplete(true);
      }
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await processAnswers(answers);
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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
  };
};

export { useQuizLogic };
export type { MovieRecommendation };