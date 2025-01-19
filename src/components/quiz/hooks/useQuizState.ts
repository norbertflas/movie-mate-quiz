import { useState } from "react";
import { useQuizLogic } from "../QuizLogic";
import type { QuizAnswer } from "../QuizTypes";
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
    if (answer === "PREV_STEP") {
      handlePrevious();
      return;
    }

    const currentQuestion = steps[currentStep];
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer
    };

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === currentQuestion.id);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });

    if (currentStep === steps.length - 1) {
      handleFinish([...answers, newAnswer]);
    } else {
      handleNext();
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
      toast({
        title: t("quiz.completed"),
        description: t("quiz.processingResults"),
      });
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      toast({
        title: t("errors.quizError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
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