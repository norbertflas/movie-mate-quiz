import { useState } from "react";
import { QuizQuestions } from "./quiz/QuizQuestions";
import { QuizResults } from "./quiz/QuizResults";
import { useQuizState } from "./quiz/hooks/useQuizState";
import { useSurveySteps } from "./quiz/constants/surveySteps";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const QuizSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const steps = useSurveySteps();
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

  const onFinish = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await handleFinish(answers);
      
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
    } finally {
      setIsSubmitting(false);
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
          <Button 
            onClick={handlePrevious}
            variant="outline"
          >
            {t("quiz.previous")}
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext}
            disabled={!answers[currentStep]}
            className="ml-auto"
          >
            {t("quiz.next")}
          </Button>
        ) : (
          <Button 
            onClick={onFinish}
            disabled={!answers[currentStep] || isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("quiz.processing")}
              </>
            ) : (
              t("quiz.finish")
            )}
          </Button>
        )}
      </div>
    </div>
  );
};