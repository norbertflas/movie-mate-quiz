import { useState } from "react";
import { api } from "@/lib/api-client";
import { getRecommendations } from "@/services/recommendations";
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

      const data = await getRecommendations({
        answers: answers as { questionId: string; answer: string | string[] }[],
      });

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from recommendations service');
      }

      // Save quiz history (best-effort; Worker derives the user, no-op if not logged in)
      try {
        await api.post('/quiz/history', { answers });
      } catch (historyError) {
        console.error('Error saving quiz history:', historyError);
      }

      return data as unknown as MovieRecommendation[];
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
