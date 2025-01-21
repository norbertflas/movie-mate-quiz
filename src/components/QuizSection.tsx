import { useState } from "react";
import { QuizQuestions } from "./quiz/QuizQuestions";
import { QuizResults } from "./quiz/QuizResults";
import { useQuizState } from "./quiz/hooks/useQuizState";
import { useSurveySteps } from "./quiz/constants/surveySteps";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Call the Edge Function with the quiz answers
      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: { answers }
      });

      if (error) {
        console.error('Error calling recommendations function:', error);
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Invalid response from recommendations function:', data);
        throw new Error('No recommendations generated');
      }

      // Update recommendations through the quiz state
      await handleFinish(data);
      
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      
      let errorMessage = t("errors.tryAgain");
      if (error instanceof Error) {
        if (error.message.includes('No recommendations generated')) {
          errorMessage = t("errors.noRecommendations");
        } else if (error.message.includes('TMDB API error')) {
          errorMessage = "Error fetching movie data. Please try again later.";
        }
      }
      
      toast({
        title: t("errors.quizError"),
        description: errorMessage,
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
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-white"
          >
            {t("quiz.previous")}
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext}
            disabled={!answers[currentStep]}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("quiz.next")}
          </Button>
        ) : (
          <Button 
            onClick={onFinish}
            disabled={!answers[currentStep] || isSubmitting}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
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