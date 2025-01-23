import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer } from "../QuizTypes";

export const useQuizSubmission = (steps: any[], onFinish: (data: any) => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuiz = async (answers: QuizAnswer[]) => {
    setIsSubmitting(true);
    try {
      console.log('Sending formatted answers to Edge Function:', answers);
      
      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: { answers }
      });

      if (error) {
        console.error('Error from Edge Function:', error);
        throw error;
      }

      console.log('Received recommendations:', data);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from recommendations service');
      }

      onFinish(data);
      return data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
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