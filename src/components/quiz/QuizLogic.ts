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
  };

  const handleQuizComplete = (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    processAnswers(quizAnswers);
    setShowResults(true);
  };

  const processAnswers = async (answers: QuizAnswer[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('quiz_history').insert({
        user_id: user.id,
        answers: answers
      });

      const movieIds = await getCollaborativeRecommendations(user.id);
      
      const recommendationsPromises = movieIds.map(async (movieId) => {
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
          explanations: ["Based on similar users' preferences"]
        };
      });

      const processedRecs = await Promise.all(recommendationsPromises);
      setRecommendations(processedRecs);
    } catch (error) {
      console.error('Error processing quiz answers:', error);
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