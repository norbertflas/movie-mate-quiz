import { useState } from "react";
import { getCollaborativeRecommendations } from "@/utils/collaborativeFiltering";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer, MovieRecommendation } from "./QuizTypes";

export const useQuizLogic = () => {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const processAnswers = async (answers: QuizAnswer[]) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save quiz answers
      await supabase.from('quiz_history').insert({
        user_id: user.id,
        answers: answers
      });

      // Get collaborative recommendations
      const collaborativeRecs = await getCollaborativeRecommendations(user.id);

      // Process and set recommendations
      const processedRecs: MovieRecommendation[] = collaborativeRecs.map(movieId => ({
        id: movieId,
        title: "", // This will be filled by the TMDB API call
        confidence: 0.8,
        explanation: "Based on similar users' preferences"
      }));

      setRecommendations(processedRecs);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
    }
  };

  return {
    recommendations,
    processAnswers
  };
};