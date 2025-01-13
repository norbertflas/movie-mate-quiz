import { MovieRecommendation } from "./QuizTypes";
import { SAMPLE_RECOMMENDATIONS } from "./QuizConstants";

interface RecommendationScore {
  score: number;
  explanations: string[];
}

const calculateRecommendationScore = (
  movie: MovieRecommendation,
  answers: Record<string, any>
): RecommendationScore => {
  let score = 0;
  const explanations: string[] = [];
  
  const weights = {
    platform: 30,
    genre: 25,
    mood: 25,
    length: 20,
    yearMatch: 10
  };

  // Platform match
  if (answers.vod && answers.vod.includes(movie.platform)) {
    score += weights.platform;
    explanations.push(`Dostępne na ${movie.platform}`);
  }

  // Genre match
  if (answers.genre && (
    movie.genre.toLowerCase() === answers.genre.toLowerCase() ||
    movie.tags?.some(tag => tag.toLowerCase() === answers.genre.toLowerCase())
  )) {
    score += weights.genre;
    explanations.push(`Pasuje do wybranego gatunku: ${answers.genre}`);
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
      score += weights.mood;
      explanations.push(`Pasuje do wybranego nastroju: ${answers.mood}`);
    }
  }

  // Length preference
  if (answers.length) {
    score += weights.length;
    explanations.push(`Pasuje do preferowanej długości: ${answers.length}`);
  }

  return { score, explanations };
};

export const getRecommendations = (answers: Record<string, any>): MovieRecommendation[] => {
  let recommendations = [...SAMPLE_RECOMMENDATIONS];
  
  // Score each movie based on user preferences
  const scoredRecommendations = recommendations.map(movie => {
    const { score, explanations } = calculateRecommendationScore(movie, answers);
    return {
      ...movie,
      score,
      explanations
    };
  });

  // Sort by score (highest first) and normalize ratings
  const sortedRecommendations = scoredRecommendations
    .sort((a, b) => b.score - a.score)
    .map(movie => ({
      ...movie,
      rating: Math.round(movie.rating * 10)
    }));

  // Return top 5 recommendations
  return sortedRecommendations.slice(0, 5);
};