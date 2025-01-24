import { useState } from "react";
import { WelcomeSection } from "../WelcomeSection";
import { QuizQuestions } from "./QuizQuestions";
import { QuizResults } from "./QuizResults";
import { QuizProgressBar } from "./QuizProgressBar";
import { useQuizLogic } from "./QuizLogic";
import { QuizAnswer } from "./QuizTypes";
import { useSurveySteps } from "./constants/surveySteps";
import { useToast } from "@/hooks/use-toast";

export const QuizSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    showQuiz, 
    showResults, 
    answers, 
    recommendations,
    handleStartQuiz, 
    handleQuizComplete 
  } = useQuizLogic();
  
  const questions = useSurveySteps();

  const handleAnswer = async (answer: string) => {
    if (!answers || answers.length >= questions.length) {
      return;
    }

    try {
      setIsSubmitting(true);
      const newAnswer: QuizAnswer = {
        questionId: questions[answers.length].id,
        answer
      };
      
      const updatedAnswers = [...answers, newAnswer];
      
      // If this was the last question, submit the quiz
      if (updatedAnswers.length === questions.length) {
        await handleQuizComplete(updatedAnswers);
        toast({
          title: "Quiz completed!",
          description: "Your recommendations are ready.",
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showQuiz) {
    return <WelcomeSection onStartQuiz={handleStartQuiz} />;
  }

  if (showResults && recommendations && recommendations.length > 0) {
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <div className="space-y-8">
      <QuizProgressBar 
        currentStep={answers.length} 
        totalSteps={questions.length} 
      />
      <QuizQuestions
        questions={questions}
        currentStep={answers.length}
        onAnswer={handleAnswer}
        answers={answers}
      />
    </div>
  );
};