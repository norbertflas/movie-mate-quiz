import { useState } from 'react';
import { MovieRecommendation, QuizAnswer } from "./QuizTypes";
import { getEnhancedRecommendations } from "./utils/recommendationEngine";
import { TMDBMovie } from "@/services/tmdb";

export const useQuizLogic = () => {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const processAnswers = async (answers: QuizAnswer[]) => {
    const answersMap = answers.reduce((acc, curr) => ({
      ...acc,
      [curr.questionId]: curr.answer
    }), {});

    try {
      const enhancedRecommendations = await getEnhancedRecommendations({
        genres: answersMap.genre ? [answersMap.genre] : undefined,
        mood: answersMap.mood,
        platform: answersMap.vod,
        releaseYear: answersMap.year,
        watchTime: answersMap.length
      });

      const formattedRecommendations: MovieRecommendation[] = enhancedRecommendations.map((movie: TMDBMovie & { score?: number, explanations?: string[] }) => ({
        id: movie.id,
        tmdbId: movie.id,
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A",
        platform: "TMDB",
        genre: "Movie",
        imageUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        description: movie.overview,
        trailerUrl: "",
        rating: movie.vote_average * 10,
        score: movie.score,
        explanations: movie.explanations
      }));

      setRecommendations(formattedRecommendations);
      return formattedRecommendations;
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      throw error;
    }
  };

  return {
    recommendations,
    processAnswers
  };
};