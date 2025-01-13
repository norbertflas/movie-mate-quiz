import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MovieRecommendation, QuizAnswer } from "./QuizTypes";
import { SAMPLE_RECOMMENDATIONS } from "./QuizConstants";

interface RecommendationScore {
  score: number;
  explanations: string[];
}

const WEIGHT_FACTORS = {
  genre: 30,
  mood: 25,
  platform: 20,
  watchHistory: 15,
  rating: 10
};

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

  // Mood match
  if (answers.mood) {
    const moodMatches = {
      "Lekki/Zabawny": ["Komedia", "Familijny", "Feel Good"],
      "Poważny/Dramatyczny": ["Dramat", "Biograficzny", "Wojenny"],
      "Trzymający w napięciu": ["Thriller", "Horror", "Kryminał", "Mystery"],
      "Inspirujący": ["Biograficzny", "Dokumentalny", "Sport", "Muzyczny"]
    };

    const relevantMoods = moodMatches[answers.mood] || [];
    if (
      relevantMoods.includes(movie.genre) ||
      movie.tags?.some(tag => relevantMoods.includes(tag))
    ) {
      score += WEIGHT_FACTORS.mood;
      explanations.push(`Matches your mood preference: ${answers.mood}`);
    }
  }

  // Platform availability
  if (answers.vod && movie.platform && answers.vod.includes(movie.platform)) {
    score += WEIGHT_FACTORS.platform;
    explanations.push(`Available on your preferred platform: ${movie.platform}`);
  }

  // Watch history integration
  try {
    const { data: watchHistory } = await supabase
      .from('watched_movies')
      .select('tmdb_id, rating')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (watchHistory) {
      // Boost score based on similar movies user has enjoyed
      const similarGenreMovies = watchHistory.filter(watched => 
        watched.rating && watched.rating > 7
      );
      
      if (similarGenreMovies.length > 0) {
        score += WEIGHT_FACTORS.watchHistory;
        explanations.push("Similar to movies you've enjoyed");
      }
    }
  } catch (error) {
    console.error('Error fetching watch history:', error);
  }

  // Rating factor
  if (movie.rating > 75) {
    score += WEIGHT_FACTORS.rating;
    explanations.push("Highly rated by other users");
  }

  return { score, explanations };
};

export const getRecommendations = async (answers: Record<string, any>): Promise<MovieRecommendation[]> => {
  let recommendations = [...SAMPLE_RECOMMENDATIONS];
  
  // Score each movie based on enhanced criteria
  const scoredRecommendationsPromises = recommendations.map(async movie => {
    const { score, explanations } = await calculateRecommendationScore(movie, answers);
    return {
      ...movie,
      score,
      explanations
    };
  });

  const scoredRecommendations = await Promise.all(scoredRecommendationsPromises);

  // Sort by score (highest first) and normalize ratings
  const sortedRecommendations = scoredRecommendations
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map(movie => ({
      ...movie,
      rating: Math.round(movie.rating * 10)
    }));

  // Return top 5 recommendations
  return sortedRecommendations.slice(0, 5);
};

export const useQuizLogic = () => {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const processAnswers = async (answers: QuizAnswer[]) => {
    const answersMap = answers.reduce((acc, curr) => ({
      ...acc,
      [curr.questionId]: curr.answer
    }), {});

    const processedRecommendations = await getRecommendations(answersMap);
    setRecommendations(processedRecommendations);
    return processedRecommendations;
  };

  return {
    recommendations,
    processAnswers
  };
};