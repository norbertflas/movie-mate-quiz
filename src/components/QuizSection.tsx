import { useState } from "react";
import { QuizQuestions } from "./quiz/QuizQuestions";
import { QuizResults } from "./quiz/QuizResults";
import { useQuizState } from "./quiz/hooks/useQuizState";
import { useSurveySteps } from "./quiz/constants/surveySteps";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export const QuizSection = () => {
  const { t } = useTranslation();
  const steps = useSurveySteps();
  const {
    currentStep,
    answers,
    recommendations,
    handleAnswer,
    handleNext,
    handlePrevious,
    isComplete
  } = useQuizState(steps);

  if (isComplete && recommendations && recommendations.length > 0) {
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <div className="space-y-6">
      <QuizQuestions
        questions={steps}
        currentStep={currentStep}
        onAnswer={handleAnswer}
        selectedAnswers={answers}
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
            onClick={handleNext}
            className="ml-auto"
          >
            {t("quiz.finish")}
          </Button>
        )}
      </div>
    </div>
  );
};