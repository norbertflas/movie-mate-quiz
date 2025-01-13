import { useState } from 'react';
import { MovieRecommendation, QuizAnswer } from "./QuizTypes";
import { SAMPLE_RECOMMENDATIONS } from "./QuizConstants";
import { WEIGHT_FACTORS } from './utils/weightFactors';
import { getMoodScore } from './utils/moodMatching';
import { getWatchHistoryScore } from './utils/watchHistory';
import { getPlatformScore } from './utils/platformMatching';

interface RecommendationScore {
  score: number;
  explanations: string[];
}

const calculateRecommendationScore = async (
  movie: MovieRecommendation,
  answers: Record<string, any>
): Promise<RecommendationScore> => {
  let score = 0;
  const explanations: string[] = [];

  // Genre match
  if (answers.genre && (
    movie.genre.toLowerCase() === answers.genre.toLowerCase() ||
    movie.tags?.some(tag => tag.toLowerCase() === answers.genre.toLowerCase())
  )) {
    score += WEIGHT_FACTORS.genre;
    explanations.push(`Matches your preferred genre: ${answers.genre}`);
  }

  // Mood matching
  if (answers.mood) {
    const moodScore = getMoodScore(movie.genre, movie.tags, answers.mood);
    if (moodScore > 0) {
      score += WEIGHT_FACTORS.mood;
      explanations.push(`Matches your mood preference: ${answers.mood}`);
    }
  }

  // Platform availability
  if (answers.vod && movie.platform) {
    const { score: platformScore, explanation } = await getPlatformScore(movie.platform);
    if (platformScore > 0) {
      score += WEIGHT_FACTORS.platform;
      if (explanation) explanations.push(explanation);
    }
  }

  // Watch history integration
  const { score: historyScore, explanation } = await getWatchHistoryScore(movie.id);
  if (historyScore !== 0) {
    score += WEIGHT_FACTORS.watchHistory * historyScore;
    if (explanation) explanations.push(explanation);
  }

  // Rating factor
  if (movie.rating > 75) {
    score += WEIGHT_FACTORS.rating;
    explanations.push("Highly rated by other users");
  } else if (movie.rating > 60) {
    score += WEIGHT_FACTORS.rating / 2;
    explanations.push("Moderately well-rated by other users");
  }

  return { score, explanations };
};

export const useQuizLogic = () => {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const processAnswers = async (answers: QuizAnswer[]) => {
    const answersMap = answers.reduce((acc, curr) => ({
      ...acc,
      [curr.questionId]: curr.answer
    }), {});

    let recommendations = [...SAMPLE_RECOMMENDATIONS];
    
    const scoredRecommendationsPromises = recommendations.map(async movie => {
      const { score, explanations } = await calculateRecommendationScore(movie, answersMap);
      return {
        ...movie,
        score,
        explanations
      };
    });

    const scoredRecommendations = await Promise.all(scoredRecommendationsPromises);

    const sortedRecommendations = scoredRecommendations
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(movie => ({
        ...movie,
        rating: Math.round(movie.rating * 10)
      }));

    setRecommendations(sortedRecommendations.slice(0, 5));
    return recommendations;
  };

  return {
    recommendations,
    processAnswers
  };
};