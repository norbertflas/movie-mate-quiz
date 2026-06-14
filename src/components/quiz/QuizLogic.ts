
import { useState } from "react";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api-client";
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
      // Save quiz history (best-effort; Worker derives the user, no-op if not logged in)
      try {
        await api.post('/quiz/history', { answers: quizAnswers });
      } catch (historyError) {
        console.error('Error saving quiz history:', historyError);
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
            explanations: ["Popular choice", "Highly rated"]
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
          explanations: ["Highly rated", "Classic film"]
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
