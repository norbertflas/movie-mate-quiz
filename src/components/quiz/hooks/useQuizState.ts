import { useState } from "react";
import { QuizAnswer, SurveyStepType } from "../QuizTypes";
import { useQuizLogic } from "../QuizLogic";

export const useQuizState = (steps: SurveyStepType[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { recommendations, processAnswers } = useQuizLogic();
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = {
      questionId: steps[currentStep].id,
      answer,
    };
    setAnswers(newAnswers);
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