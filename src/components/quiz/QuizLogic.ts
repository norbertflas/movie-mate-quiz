
import { useState } from "react";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { parseQuizAnswers, getPersonalizedRecommendations, generateFallbackRecommendations } from "./utils/quizRecommendationLogic";

export const useQuizLogic = (): QuizLogicHook => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = () => {
    console.log('🎬 [Quiz] Starting quiz...');
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setAnswerMap({});
    setRecommendations([]);
  };

  const processAnswers = async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    setIsLoading(true);
    console.log('🔄 [Quiz] Processing answers:', quizAnswers);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save quiz history if user is authenticated
      if (user) {
        const { error: historyError } = await supabase
          .from('quiz_history')
          .insert([{ user_id: user.id, answers: quizAnswers }]);

        if (historyError) {
          console.error('Error saving quiz history:', historyError);
        } else {
          console.log('✅ Quiz history saved');
        }
      }

      // Parse the quiz answers into structured filters
      const filters = parseQuizAnswers(quizAnswers);
      console.log('📝 Parsed filters:', filters);

      // Update answer map for UI consistency
      const answerMap = quizAnswers.reduce((map, answer) => {
        map[answer.questionId] = answer.answer;
        return map;
      }, {} as Record<string, string>);
      setAnswerMap(answerMap);

      let recommendationsResult: MovieRecommendation[] = [];

      try {
        // Try to get personalized recommendations from the edge function
        console.log('🚀 Calling personalized recommendations...');
        recommendationsResult = await getPersonalizedRecommendations(filters);
        console.log('✅ Got personalized recommendations:', recommendationsResult.length);
      } catch (edgeFunctionError) {
        console.error('❌ Edge function failed, using fallback:', edgeFunctionError);
        
        // If edge function fails, use fallback logic
        recommendationsResult = generateFallbackRecommendations(filters);
        console.log('✅ Generated fallback recommendations:', recommendationsResult.length);
      }

      // Ensure we have some recommendations
      if (recommendationsResult.length === 0) {
        console.warn('⚠️ No recommendations found, generating emergency fallback');
        recommendationsResult = [
          {
            id: 550,
            title: "Fight Club",
            overview: "An insomniac office worker forms an underground fight club.",
            poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
            release_date: "1999-10-15",
            vote_average: 8.4,
            genre: "Drama",
            trailer_url: null,
            tmdbId: 550,
            explanations: ["Popular choice", "Highly rated"],
            streamingServices: []
          }
        ];
      }

      setAnswers(quizAnswers);
      setRecommendations(recommendationsResult);
      setShowResults(true);

      toast({
        title: t("quiz.completed") || "Quiz Completed!",
        description: t("quiz.recommendations.ready") || `Found ${recommendationsResult.length} recommendations`,
      });

      return recommendationsResult;
    } catch (error) {
      console.error('💥 Error processing quiz answers:', error);
      
      // Final fallback - basic recommendations
      const basicRecommendations: MovieRecommendation[] = [
        {
          id: 238,
          title: "The Shawshank Redemption",
          overview: "Two imprisoned men bond over a number of years.",
          poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
          release_date: "1994-09-23",
          vote_average: 9.3,
          genre: "Drama",
          trailer_url: null,
          tmdbId: 238,
          explanations: ["Highly rated", "Classic film"],
          streamingServices: []
        }
      ];
      
      setAnswers(quizAnswers);
      setRecommendations(basicRecommendations);
      setShowResults(true);

      toast({
        title: t("quiz.error") || "Error",
        description: "Using fallback recommendations",
        variant: "destructive"
      });

      return basicRecommendations;
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    try {
      console.log('🏁 Quiz completion triggered with answers:', quizAnswers);
      const recommendations = await processAnswers(quizAnswers);
      return recommendations;
    } catch (error) {
      console.error('💥 Error completing quiz:', error);
      throw error;
    }
  };

  return {
    showQuiz,
    showResults,
    answers,
    answerMap,
    recommendations,
    isLoading,
    handleStartQuiz,
    handleQuizComplete,
    processAnswers
  };
};
