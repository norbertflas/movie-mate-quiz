import { useState } from "react";
import { getCollaborativeRecommendations } from "@/utils/collaborativeFiltering";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { getMovieDetails } from "@/services/tmdb";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useQuizLogic = (): QuizLogicHook => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setRecommendations([]);
  };

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    try {
      await processAnswers(quizAnswers);
      setShowResults(true);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      toast({
        title: t("errors.recommendationError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const processAnswers = async (answers: QuizAnswer[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is authenticated, save quiz history
      if (user) {
        await supabase.from('quiz_history').insert({
          user_id: user.id,
          answers: answers
        });
      }

      // Get recommendations regardless of authentication status
      const movieIds = user ? 
        await getCollaborativeRecommendations(user.id) :
        // Fallback to a simpler recommendation logic for non-authenticated users
        [299536, 24428, 99861, 157336, 118340, 293660].slice(0, 6);
      
      if (!movieIds || movieIds.length === 0) {
        throw new Error("No recommendations generated");
      }

      const recommendationsPromises = movieIds.map(async (movieId) => {
        try {
          const movieDetails = await getMovieDetails(movieId);
          const streamingServices = await getStreamingAvailability(movieId);
          
          const recommendation: MovieRecommendation = {
            id: movieId,
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear().toString() : "N/A",
            platform: streamingServices[0]?.service || "Not available",
            genre: movieDetails.genres?.[0]?.name || "Unknown",
            imageUrl: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
            description: movieDetails.overview,
            trailerUrl: "",
            rating: movieDetails.vote_average * 10,
            score: movieDetails.popularity / 100,
            explanations: [
              "Based on your quiz answers",
              "Matches your preferred genres",
              ...(user ? ["Popular among users with similar taste"] : []),
              ...(streamingServices.length > 0 ? [`Available on ${streamingServices.map(s => s.service).join(', ')}`] : [])
            ]
          };
          return recommendation;
        } catch (error) {
          console.error(`Error fetching details for movie ${movieId}:`, error);
          return null;
        }
      });

      const processedRecs = (await Promise.all(recommendationsPromises))
        .filter((rec): rec is MovieRecommendation => rec !== null)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);

      if (processedRecs.length === 0) {
        throw new Error("Failed to process recommendations");
      }

      setRecommendations(processedRecs);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      throw error;
    }
  };

  return {
    showQuiz,
    showResults,
    answers,
    recommendations,
    handleStartQuiz,
    handleQuizComplete,
    processAnswers
  };
};

export type { MovieRecommendation };