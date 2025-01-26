import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer, MovieRecommendation } from "../QuizTypes";

export const useQuizSubmission = (
  steps: any[], 
  onFinish: (data: MovieRecommendation[]) => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuiz = async (answers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    setIsSubmitting(true);
    try {
      console.log('Submitting quiz answers:', answers);
      
      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: { answers }
      });

      if (error) {
        console.error('Error from Edge Function:', error);
        throw error;
      }

      console.log('Received recommendations from Edge Function:', data);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from recommendations service');
      }

      // Save quiz history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('quiz_history')
          .insert([{ 
            user_id: user.id, 
            answers 
          }]);
      }

      return data as MovieRecommendation[];
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