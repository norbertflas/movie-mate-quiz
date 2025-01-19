import { useState } from "react";
import { QuizQuestions } from "./quiz/QuizQuestions";
import { QuizResults } from "./quiz/QuizResults";
import { useQuizState } from "./quiz/hooks/useQuizState";
import { useSurveySteps } from "./quiz/constants/surveySteps";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export const QuizSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const steps = useSurveySteps();
  const {
    currentStep,
    answers,
    recommendations,
    handleAnswer,
    handleNext,
    handlePrevious,
    isComplete,
    processAnswers
  } = useQuizState(steps);

  const handleFinish = async () => {
    try {
      await processAnswers(answers);
      if (!recommendations || recommendations.length === 0) {
        toast({
          title: t("errors.noRecommendations"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      toast({
        title: t("errors.quizError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };

  if (isComplete && recommendations && recommendations.length > 0) {
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <div className="space-y-6">
      <QuizQuestions
        questions={steps}
        currentStep={currentStep}
        onAnswer={handleAnswer}
        answers={answers}
      />
      
      <div className="flex justify-between mt-4">
        {currentStep > 0 && (
          <Button onClick={handlePrevious}>
            {t("quiz.previous")}
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button 
            onClick={handleNext}
            disabled={!answers[currentStep]}
            className="ml-auto"
          >
            {t("quiz.next")}
          </Button>
        )}
        {currentStep === steps.length - 1 && answers[currentStep] && (
          <Button 
            onClick={handleFinish}
            className="ml-auto"
          >
            {t("quiz.finish")}
          </Button>
        )}
      </div>
    </div>
  );
};