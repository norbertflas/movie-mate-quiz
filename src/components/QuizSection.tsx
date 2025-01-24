import { QuizResults } from "./quiz/QuizResults";
import { useQuizState } from "./quiz/hooks/useQuizState";
import { useSurveySteps } from "./quiz/constants/surveySteps";
import { useQuizSubmission } from "./quiz/hooks/useQuizSubmission";
import { QuizForm } from "./quiz/QuizForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { QuizAnswer } from "./quiz/QuizTypes";

export const QuizSection = () => {
  const { toast } = useToast();
  const steps = useSurveySteps();
  const [showResults, setShowResults] = useState(false);
  const {
    currentStep,
    answers,
    recommendations,
    handleAnswer,
    handleNext,
    handlePrevious,
    isComplete,
    handleFinish
  } = useQuizState(steps);

  const { isSubmitting, submitQuiz } = useQuizSubmission(steps, handleFinish);

  const onFinish = async () => {
    try {
      if (!answers || answers.length === 0) {
        toast({
          title: "Error",
          description: "Please answer all questions before submitting",
          variant: "destructive",
        });
        return;
      }

      // Format answers properly before submission
      const formattedAnswers = steps.map((step, index) => {
        const answer = answers[index];
        if (!answer) {
          console.error('Missing answer for step:', step.id);
          return null;
        }
        return {
          questionId: step.id,
          answer: answer.answer || ''
        };
      }).filter((answer): answer is QuizAnswer => answer !== null);

      console.log('Formatted answers before submission:', formattedAnswers);

      if (formattedAnswers.length !== steps.length) {
        toast({
          title: "Error",
          description: "Please answer all questions before submitting",
          variant: "destructive",
        });
        return;
      }

      const results = await submitQuiz(formattedAnswers);
      
      if (results && results.length > 0) {
        setShowResults(true);
        toast({
          title: "Success",
          description: "Your recommendations are ready!",
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showResults && recommendations && recommendations.length > 0) {
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <QuizForm
      steps={steps}
      currentStep={currentStep}
      answers={answers}
      isSubmitting={isSubmitting}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onFinish={onFinish}
    />
  );
};