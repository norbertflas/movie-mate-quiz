import { useState } from "react";
import { WelcomeSection } from "../WelcomeSection";
import { QuizQuestions } from "./QuizQuestions";
import { QuizResults } from "./QuizResults";
import { QuizProgressBar } from "./QuizProgressBar";
import { useQuizLogic } from "./QuizLogic";
import { QuizAnswer } from "./QuizTypes";
import { useSurveySteps } from "./constants/surveySteps";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const QuizSection = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const questions = useSurveySteps();
  
  const { 
    showQuiz, 
    showResults, 
    answers, 
    recommendations,
    handleStartQuiz, 
    handleQuizComplete 
  } = useQuizLogic();

  const getNextQuestionIndex = (currentIndex: number, newAnswers: QuizAnswer[]): number => {
    if (currentIndex >= questions.length - 1) return currentIndex;

    const currentQuestionId = questions[currentIndex].id;
    
    if (currentQuestionId === "type") {
      const contentTypeAnswer = newAnswers.find(a => a.questionId === "type")?.answer;
      
      if (contentTypeAnswer === t("quiz.options.movie")) {
        return 2;
      }
      else if (contentTypeAnswer === t("quiz.options.series")) {
        return currentIndex + 1;
      }
    }

    return currentIndex + 1;
  };

  const handleAnswer = async (answer: string) => {
    try {
      if (isSubmitting) return;

      setIsSubmitting(true);
      
      const newAnswer: QuizAnswer = {
        questionId: questions[currentStep].id,
        answer
      };
      
      const updatedAnswers = [...answers];
      updatedAnswers[currentStep] = newAnswer;
      
      const nextStep = getNextQuestionIndex(currentStep, updatedAnswers);
      
      if (nextStep === currentStep || nextStep >= questions.length) {
        await handleQuizComplete(updatedAnswers);
        toast({
          title: t("quiz.completed"),
          description: t("quiz.recommendations.ready"),
        });
      } else {
        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error('Error in quiz answer:', error);
      toast({
        title: t("errors.quizError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    let prevStep = currentStep - 1;
    
    const contentTypeAnswer = answers.find(a => a.questionId === "type")?.answer;
    
    if (currentStep === 2 && contentTypeAnswer === t("quiz.options.movie")) {
      prevStep = 1;
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  };

  const handleNext = async () => {
    if (!answers[currentStep]) {
      toast({
        title: t("errors.missingAnswer"),
        description: t("errors.pleaseSelectOption"),
        variant: "destructive",
      });
      return;
    }

    const nextStep = getNextQuestionIndex(currentStep, answers);
    
    if (nextStep === currentStep || nextStep >= questions.length) {
      try {
        setIsSubmitting(true);
        await handleQuizComplete(answers);
        toast({
          title: t("quiz.completed"),
          description: t("quiz.recommendations.ready"),
        });
      } catch (error) {
        console.error('Error completing quiz:', error);
        toast({
          title: t("errors.quizError"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(nextStep);
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
        currentStep={currentStep + 1} 
        totalSteps={questions.length} 
      />
      
      <QuizQuestions
        questions={questions}
        currentStep={currentStep}
        onAnswer={handleAnswer}
        answers={answers}
      />

      <div className="flex justify-between mt-6">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("quiz.previous")}
          </Button>
        )}

        <Button
          onClick={handleNext}
          disabled={!answers[currentStep] || isSubmitting}
          className="ml-auto flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("quiz.processing")}
            </>
          ) : currentStep >= questions.length - 1 ? (
            <>
              {t("quiz.finish")}
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              {t("quiz.next")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
