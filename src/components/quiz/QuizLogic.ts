import { MovieRecommendation } from "./QuizTypes";
import { SAMPLE_RECOMMENDATIONS } from "./QuizConstants";

const calculateRecommendationScore = (movie: MovieRecommendation, answers: Record<string, any>): number => {
  let score = 0;
  const weights = {
    platform: 30,
    genre: 25,
    mood: 25,
    length: 20
  };

  // Platform match
  if (answers.vod && answers.vod.includes(movie.platform)) {
    score += weights.platform;
  }

  // Genre match
  if (answers.genre && (
    movie.genre.toLowerCase() === answers.genre.toLowerCase() ||
    movie.tags?.some(tag => tag.toLowerCase() === answers.genre.toLowerCase())
  )) {
    score += weights.genre;
  }

  // Mood match (based on tags and genre)
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
      score += weights.mood;
    }
  }

  // Length preference (if specified)
  if (answers.length) {
    // Add logic for length matching when that data becomes available
    score += weights.length / 2; // Partial score for now
  }

  return score;
};

export const getRecommendations = (answers: Record<string, any>): MovieRecommendation[] => {
  // Start with all recommendations
  let recommendations = [...SAMPLE_RECOMMENDATIONS];
  
  // Score each movie based on user preferences
  const scoredRecommendations = recommendations.map(movie => ({
    ...movie,
    score: calculateRecommendationScore(movie, answers)
  }));

  // Sort by score (highest first) and normalize ratings to 0-100 scale
  const sortedRecommendations = scoredRecommendations
    .sort((a, b) => b.score - a.score)
    .map(movie => ({
      ...movie,
      rating: Math.round(movie.rating * 10) // Convert 0-10 scale to 0-100
    }));

  // Return top 5 recommendations
  return sortedRecommendations.slice(0, 5);
};