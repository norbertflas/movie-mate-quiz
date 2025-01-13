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

  // Genre match with higher granularity
  if (answers.genre && (
    movie.genre.toLowerCase() === answers.genre.toLowerCase() ||
    movie.tags?.some(tag => tag.toLowerCase() === answers.genre.toLowerCase())
  )) {
    score += WEIGHT_FACTORS.genre;
    explanations.push(`Matches your preferred genre: ${answers.genre}`);
  }

  // Enhanced mood matching
  if (answers.mood) {
    const moodMatches = {
      "Lekki/Zabawny": ["Komedia", "Familijny", "Feel Good", "Animacja"],
      "Poważny/Dramatyczny": ["Dramat", "Biograficzny", "Wojenny", "Historyczny"],
      "Trzymający w napięciu": ["Thriller", "Horror", "Kryminał", "Mystery", "Akcja"],
      "Inspirujący": ["Biograficzny", "Dokumentalny", "Sport", "Muzyczny", "Przygodowy"]
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

  // Platform availability with user preferences
  if (answers.vod && movie.platform) {
    const userPreferences = await supabase
      .from('user_streaming_preferences')
      .select('service_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (userPreferences.data?.some(pref => pref.service_id === movie.platform)) {
      score += WEIGHT_FACTORS.platform;
      explanations.push(`Available on your preferred platform: ${movie.platform}`);
    }
  }

  // Watch history integration with sophisticated matching
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
        explanations.push("Similar to movies you've enjoyed in the past");
      }

      // Penalize if user has recently watched similar movies
      const recentlyWatched = watchHistory.some(watched => 
        watched.tmdb_id === movie.tmdbId
      );
      
      if (recentlyWatched) {
        score -= WEIGHT_FACTORS.watchHistory;
        explanations.push("You've recently watched this movie");
      }
    }
  } catch (error) {
    console.error('Error fetching watch history:', error);
  }

  // Rating factor with weighted scoring
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
    
    // Score each movie based on enhanced criteria
    const scoredRecommendationsPromises = recommendations.map(async movie => {
      const { score, explanations } = await calculateRecommendationScore(movie, answersMap);
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

    // Store top 5 recommendations
    setRecommendations(sortedRecommendations.slice(0, 5));
    return recommendations;
  };

  return {
    recommendations,
    processAnswers
  };
};