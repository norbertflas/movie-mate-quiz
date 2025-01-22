import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer } from "../QuizTypes";
import type { SurveyStepType } from "../QuizTypes";

export const useQuizSubmission = (
  steps: SurveyStepType[],
  handleFinish: (data: any) => Promise<void>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const submitQuiz = async (answers: QuizAnswer[]) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate answers array
      if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error('No answers provided');
      }
      
      // Format and validate each answer
      const formattedAnswers = answers.map((answer, index) => {
        if (!answer || !answer.answer) {
          throw new Error(`Invalid answer at question ${index + 1}`);
        }
        return {
          questionId: answer.questionId || steps[index].id,
          answer: String(answer.answer)
        };
      });
      
      console.log('Sending formatted answers to Edge Function:', formattedAnswers);
      
      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: { answers: formattedAnswers }
      });

      if (error) {
        console.error('Error calling recommendations function:', error);
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Invalid response from recommendations function:', data);
        throw new Error('No recommendations generated');
      }

      console.log('Received recommendations:', data);
      await handleFinish(data);
      
      toast({
        title: t("quiz.completed"),
        description: t("quiz.recommendationsReady"),
      });
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
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitQuiz
  };
};