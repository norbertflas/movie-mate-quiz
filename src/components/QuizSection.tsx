import { useState } from "react";
import { QuizQuestions } from "./quiz/QuizQuestions";
import { QuizResults } from "./quiz/QuizResults";
import { NavigationButtons } from "./quiz/NavigationButtons";
import { QuizProgress } from "./quiz/QuizProgress";
import { useQuizState } from "./quiz/hooks/useQuizState";
import { useSurveySteps } from "./quiz/constants/surveySteps";
import { MovieRecommendation } from "./quiz/QuizTypes";

export const QuizSection = () => {
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

  if (isComplete) {
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <div className="space-y-6">
      <QuizQuestions
        questions={steps}
        onComplete={(answers) => {
          // Handle quiz completion
          console.log("Quiz completed with answers:", answers);
        }}
      />

      <NavigationButtons
        currentStep={currentStep}
        canGoNext={answers[currentStep]?.answer !== undefined}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      <QuizProgress
        currentStep={currentStep}
        totalSteps={steps.length}
      />
    </div>
  );
};