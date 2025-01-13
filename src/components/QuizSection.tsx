import { useState } from "react";
import { QuizQuestions } from "./quiz/QuizQuestions";
import { QuizResults } from "./quiz/QuizResults";
import { NavigationButtons } from "./quiz/NavigationButtons";
import { QuizProgress } from "./quiz/QuizProgress";
import { useQuizState } from "./quiz/hooks/useQuizState";
import type { SurveyStepType } from "./quiz/QuizTypes";
import { useSurveySteps } from "./quiz/constants/surveySteps";

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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (isComplete) {
    return <QuizResults movieRecommendations={recommendations} />;
  }

  return (
    <div className="space-y-6">
      <QuizQuestions
        questions={steps}
        currentQuestion={currentStep}
        onAnswer={handleAnswer}
      />

      <NavigationButtons
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentStep={currentQuestionIndex}
        totalSteps={steps.length}
      />

      <QuizProgress
        currentStep={currentQuestionIndex}
        totalSteps={steps.length}
      />
    </div>
  );
};