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

      // Validate answers before formatting
      const validAnswers = answers.every(answer => 
        answer && 
        answer.questionId && 
        answer.answer && 
        typeof answer.answer === 'string'
      );

      if (!validAnswers) {
        console.error('Invalid answers format:', answers);
        toast({
          title: "Error",
          description: "Some answers are invalid. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Format answers properly before submission
      const formattedAnswers: QuizAnswer[] = answers.map((answer, index) => ({
        questionId: steps[index].id,
        answer: answer.answer
      }));

      console.log('Submitting quiz with formatted answers:', formattedAnswers);
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