import { useState } from "react";
import { getCollaborativeRecommendations } from "@/utils/collaborativeFiltering";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer, MovieRecommendation, QuizLogicHook } from "./QuizTypes";
import { getMovieDetails } from "@/services/tmdb";

export const useQuizLogic = (): QuizLogicHook => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowResults(false);
    setAnswers([]);
    setRecommendations([]);
  };

  const handleQuizComplete = (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    processAnswers(quizAnswers);
    setShowResults(true);
  };

  const processAnswers = async (answers: QuizAnswer[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Store quiz answers in history
      await supabase.from('quiz_history').insert({
        user_id: user.id,
        answers: answers
      });

      // Get movie recommendations based on user preferences
      const movieIds = await getCollaborativeRecommendations(user.id);
      
      if (!movieIds || movieIds.length === 0) {
        throw new Error("No recommendations generated");
      }

      // Fetch detailed movie information for each recommendation
      const recommendationsPromises = movieIds.map(async (movieId) => {
        try {
          const movieDetails = await getMovieDetails(movieId);
          return {
            id: movieId,
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear().toString() : "N/A",
            platform: "TMDB",
            genre: movieDetails.genres?.[0]?.name || "Unknown",
            imageUrl: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
            description: movieDetails.overview,
            trailerUrl: "",
            rating: movieDetails.vote_average * 10,
            score: 0.8,
            explanations: [
              "Based on your quiz answers",
              "Matches your preferred genres",
              "Popular among users with similar taste"
            ]
          };
        } catch (error) {
          console.error(`Error fetching details for movie ${movieId}:`, error);
          return null;
        }
      });

      const processedRecs = (await Promise.all(recommendationsPromises))
        .filter((rec): rec is MovieRecommendation => rec !== null)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
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