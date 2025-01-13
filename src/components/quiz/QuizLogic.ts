import { useState } from 'react';
import { MovieRecommendation, QuizAnswer } from "./QuizTypes";
import { getEnhancedRecommendations } from "./utils/recommendationEngine";
import { TMDBMovie } from "@/services/tmdb";
import { getCollaborativeScore } from "./utils/collaborativeFiltering";
import { getGenreCompatibilityScore } from "./utils/genreMatching";
import { getMoodScore } from "./utils/moodMatching";

interface QuizAnswersMap {
  genre?: string;
  mood?: string;
  vod?: string;
  year?: string;
  length?: string;
}

export const useQuizLogic = () => {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const processAnswers = async (answers: QuizAnswer[]) => {
    const answersMap: QuizAnswersMap = answers.reduce((acc, curr) => ({
      ...acc,
      [curr.questionId]: curr.answer
    }), {} as QuizAnswersMap);

    try {
      const enhancedRecommendations = await getEnhancedRecommendations({
        genres: answersMap.genre ? [answersMap.genre] : undefined,
        mood: answersMap.mood,
        platform: answersMap.vod,
        releaseYear: answersMap.year,
        watchTime: answersMap.length,
        minVoteCount: 100,
        minVoteAverage: 6.5,
        includeAdult: false
      });

      const formattedRecommendations: MovieRecommendation[] = await Promise.all(
        enhancedRecommendations.map(async (movie: TMDBMovie & { score?: number, explanations?: string[] }) => {
          const [collaborativeScore, genreScore, moodScore] = await Promise.all([
            getCollaborativeScore(movie.id),
            getGenreCompatibilityScore(movie.genre_ids.join(','), answersMap.genre || ''),
            getMoodScore(movie.genre_ids[0]?.toString() || '', [], answersMap.mood || '')
          ]);

          const totalScore = (
            (collaborativeScore.score * 0.3) +
            (genreScore.score * 0.3) +
            (moodScore * 0.2) +
            ((movie.vote_average / 10) * 0.2)
          );

          const explanations = [
            collaborativeScore.explanation,
            genreScore.explanation,
            `Overall rating: ${Math.round(movie.vote_average * 10)}/100`
          ].filter(Boolean);

          return {
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
            score: totalScore,
            explanations
          };
        })
      );

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