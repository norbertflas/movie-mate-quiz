import { useState } from 'react';
import { MovieRecommendation, QuizAnswer } from "./QuizTypes";
import { SAMPLE_RECOMMENDATIONS } from "./constants/sampleRecommendations";
import { WEIGHT_FACTORS } from './utils/weightFactors';
import { getMoodScore } from './utils/moodMatching';
import { getWatchHistoryScore } from './utils/watchHistory';
import { getPlatformScore } from './utils/platformMatching';
import { getCollaborativeScore } from './utils/collaborativeFiltering';
import { getGenreCompatibilityScore } from './utils/genreMatching';

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

  // Genre match with enhanced compatibility scoring
  const { score: genreScore, explanation: genreExplanation } = 
    await getGenreCompatibilityScore(movie.genre, answers.genre);
  if (genreScore > 0) {
    score += WEIGHT_FACTORS.genre * genreScore;
    explanations.push(genreExplanation);
  }

  // Mood matching with contextual analysis
  if (answers.mood) {
    const moodScore = getMoodScore(movie.genre, movie.tags, answers.mood);
    if (moodScore > 0) {
      score += WEIGHT_FACTORS.mood * moodScore;
      explanations.push(`Matches your mood preference: ${answers.mood}`);
    }
  }

  // Platform availability with regional support
  if (answers.vod && movie.platform) {
    const { score: platformScore, explanation } = await getPlatformScore(movie.platform);
    if (platformScore > 0) {
      score += WEIGHT_FACTORS.platform * platformScore;
      if (explanation) explanations.push(explanation);
    }
  }

  // Watch history integration
  const { score: historyScore, explanation: historyExplanation } = 
    await getWatchHistoryScore(movie.tmdbId || movie.id);
  if (historyScore !== 0) {
    score += WEIGHT_FACTORS.watchHistory * historyScore;
    if (historyExplanation) explanations.push(historyExplanation);
  }

  // Collaborative filtering
  if (movie.tmdbId) {
    const { score: collaborativeScore, explanation: collaborativeExplanation } = 
      await getCollaborativeScore(movie.tmdbId);
    if (collaborativeScore > 0) {
      score += WEIGHT_FACTORS.collaborative * collaborativeScore;
      if (collaborativeExplanation) explanations.push(collaborativeExplanation);
    }
  }

  // Rating factor with weighted recent ratings
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

    const initialRecommendations = SAMPLE_RECOMMENDATIONS.map(movie => ({
      ...movie,
      id: movie.tmdbId || movie.id || Math.floor(Math.random() * 10000)
    }));
    
    const scoredRecommendationsPromises = initialRecommendations.map(async movie => {
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