import { useState, useEffect } from "react";
import { QuizResults } from "./quiz/QuizResults";
import { useQuizState } from "./quiz/hooks/useQuizState";
import { useSurveySteps } from "./quiz/constants/surveySteps";
import { useQuizSubmission } from "./quiz/hooks/useQuizSubmission";
import { QuizForm } from "./quiz/QuizForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer } from "./quiz/QuizTypes";

export const QuizSection = () => {
  const { toast } = useToast();
  const steps = useSurveySteps();
  const [showResults, setShowResults] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  // Log state changes
  useEffect(() => {
    console.log('Quiz state updated:', {
      currentStep,
      answersCount: answers?.length,
      hasRecommendations: recommendations?.length > 0,
      isComplete,
      showResults
    });
  }, [currentStep, answers, recommendations, isComplete, showResults]);

  const validateAnswers = (answers: QuizAnswer[]): boolean => {
    console.log('Validating answers:', answers);
    
    if (!answers || answers.length === 0) {
      console.error('No answers provided');
      return false;
    }

    if (answers.length !== steps.length) {
      console.error(`Incomplete answers: ${answers.length}/${steps.length}`);
      return false;
    }

    const hasInvalidAnswer = answers.some((answer, index) => {
      if (!answer || !answer.answer) {
        console.error(`Invalid answer at step ${index + 1}:`, answer);
        return true;
      }
      return false;
    });

    return !hasInvalidAnswer;
  };

  const saveQuizHistory = async (answers: QuizAnswer[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, skipping quiz history save');
        return;
      }

      const { error } = await supabase
        .from('quiz_history')
        .insert([{
          user_id: user.id,
          answers: answers
        }]);

      if (error) {
        console.error('Error saving quiz history:', error);
        throw error;
      }

      console.log('Quiz history saved successfully');
    } catch (error) {
      console.error('Failed to save quiz history:', error);
      toast({
        title: "Warning",
        description: "Your quiz answers were processed but couldn't be saved to history.",
        variant: "destructive",
      });
    }
  };

  const onFinish = async () => {
    console.log('Starting quiz submission process');
    setIsProcessing(true);

    try {
      if (!validateAnswers(answers)) {
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
        if (!answer || !answer.answer) {
          console.error('Missing answer for step:', step.id);
          return null;
        }
        
        return {
          questionId: step.id,
          answer: answer.answer
        };
      }).filter((answer): answer is QuizAnswer => answer !== null);

      console.log('Submitting formatted answers:', formattedAnswers);

      const results = await submitQuiz(formattedAnswers);
      
      if (results && Array.isArray(results) && results.length > 0) {
        console.log('Received recommendations:', results);
        await saveQuizHistory(formattedAnswers);
        handleFinish(results);
        setShowResults(true);
        toast({
          title: "Success",
          description: `Found ${results.length} movie recommendations for you!`,
        });
      } else {
        console.error('No valid recommendations received');
        toast({
          title: "Error",
          description: "No recommendations found. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Additional state logging
  useEffect(() => {
    if (recommendations?.length > 0) {
      console.log('Recommendations updated:', {
        count: recommendations.length,
        firstRecommendation: recommendations[0]
      });
    }
  }, [recommendations]);

  if (showResults && recommendations && recommendations.length > 0) {
    console.log('Rendering quiz results with recommendations:', recommendations);
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <QuizForm
      steps={steps}
      currentStep={currentStep}
      answers={answers}
      isSubmitting={isSubmitting || isProcessing}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onFinish={onFinish}
    />
  );
};