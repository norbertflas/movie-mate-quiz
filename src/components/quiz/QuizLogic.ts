
import { useState } from "react";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export const useQuizLogic = (): QuizLogicHook => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setAnswerMap({});
    setRecommendations([]);
  };

  const processAnswers = async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    try {
      console.log('Processing quiz answers:', quizAnswers);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save quiz history if user is authenticated
      if (user) {
        const { error: historyError } = await supabase
          .from('quiz_history')
          .insert([{ user_id: user.id, answers: quizAnswers }]);

        if (historyError) {
          console.error('Error saving quiz history:', historyError);
        }
      }

      // Convert answers array to a structured format for easier processing
      const answers = quizAnswers.reduce((map, answer) => {
        map[answer.questionId] = answer.answer;
        return map;
      }, {} as Record<string, string>);
      
      setAnswerMap(answers);
      console.log('Answer map for processing:', answers);

      // Get recommendations from Edge Function
      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: { 
          answers: quizAnswers,
          userId: user?.id,
          includeExplanations: true,
          answerMap: answers // Send structured answers for easier processing
        }
      });

      if (error) {
        console.error('Error invoking edge function:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.error('Invalid response from recommendations service:', data);
        throw new Error('Invalid response from recommendations service');
      }

      console.log('Received recommendations:', data);
      setAnswers(quizAnswers);
      setRecommendations(data);
      setShowResults(true);
      return data as MovieRecommendation[];
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      
      // Fallback recommendations if the edge function fails
      const fallbackRecommendations = generateFallbackRecommendations(quizAnswers);
      setRecommendations(fallbackRecommendations);
      setShowResults(true);
      return fallbackRecommendations;
    }
  };

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]): Promise<MovieRecommendation[]> => {
    try {
      const recommendations = await processAnswers(quizAnswers);
      return recommendations;
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  };

  // Fallback method to generate recommendations if the API fails
  const generateFallbackRecommendations = (quizAnswers: QuizAnswer[]): MovieRecommendation[] => {
    // Create a map of the answers for easier access
    const answerMap = quizAnswers.reduce((map, answer) => {
      map[answer.questionId] = answer.answer;
      return map;
    }, {} as Record<string, string>);

    // Basic fallback recommendations
    const fallbacks: MovieRecommendation[] = [
      {
        id: 1,
        title: "The Avengers",
        overview: "Earth's mightiest heroes must come together to save the world.",
        poster_path: "/cezWGskPY5x7GaglTTRN4Fugfb8.jpg",
        release_date: "2012-04-25",
        vote_average: 7.7,
        genre: "Action",
        trailer_url: null,
        platform: "Disney+",
        explanations: ["Popular superhero movie with great action sequences"]
      },
      {
        id: 2,
        title: "The Office",
        overview: "A mockumentary on a group of office workers.",
        poster_path: "/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
        release_date: "2005-03-24",
        vote_average: 8.5,
        genre: "Comedy",
        trailer_url: null,
        platform: "Netflix",
        type: "series",
        explanations: ["Highly rated comedy series with multiple seasons"]
      },
      {
        id: 3,
        title: "Stranger Things",
        overview: "When a young boy disappears, his mother and friends must confront terrifying forces.",
        poster_path: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
        release_date: "2016-07-15",
        vote_average: 8.3,
        genre: "Sci-Fi & Fantasy",
        trailer_url: null,
        platform: "Netflix",
        type: "series",
        explanations: ["Popular sci-fi series with supernatural elements"]
      }
    ];

    // Return filtered recommendations based on user preferences if possible
    const contentType = answerMap.contentType;
    const mood = answerMap.mood;
    const platforms = answerMap.platforms || "";

    // Simple filtering logic
    return fallbacks.filter(rec => {
      // Filter by content type if specified
      if (contentType && contentType !== t("quiz.options.notSure")) {
        if (contentType === t("quiz.options.movie") && rec.type === "series") return false;
        if (contentType === t("quiz.options.series") && !rec.type) return false;
      }
      
      // Filter by platform if specified and not empty
      if (platforms && platforms !== "" && platforms !== "[]") {
        try {
          const userPlatforms = JSON.parse(platforms);
          if (Array.isArray(userPlatforms) && userPlatforms.length > 0 && rec.platform) {
            if (!userPlatforms.includes(rec.platform)) return false;
          }
        } catch (e) {
          console.error("Error parsing platforms:", e);
        }
      }
      
      return true;
    });
  };

  return {
    showQuiz,
    showResults,
    answers,
    answerMap,
    recommendations,
    handleStartQuiz,
    handleQuizComplete,
    processAnswers
  };
};
