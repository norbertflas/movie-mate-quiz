import { MovieRecommendation } from "./QuizTypes";
import { SAMPLE_RECOMMENDATIONS } from "./QuizConstants";

export const getRecommendations = (answers: Record<string, any>): MovieRecommendation[] => {
  let recommendations = [...SAMPLE_RECOMMENDATIONS];
  
  // Filter by selected VOD services
  if (answers.vod && answers.vod.length > 0) {
    const filteredByVod = recommendations.filter(movie => 
      answers.vod.includes(movie.platform)
    );
    // If we have enough movies after VOD filtering, use those. Otherwise, keep all movies
    if (filteredByVod.length >= 5) {
      recommendations = filteredByVod;
    }
  }

  // Filter by genre if specified
  if (answers.genre) {
    const filteredByGenre = recommendations.filter(movie => 
      movie.genre.toLowerCase() === answers.genre.toLowerCase()
    );
    // If we have enough movies after genre filtering, use those. Otherwise, keep previous selection
    if (filteredByGenre.length >= 5) {
      recommendations = filteredByGenre;
    }
  }

  // Ensure we always return exactly 5 recommendations
  recommendations = recommendations.sort(() => Math.random() - 0.5);
  
  // If we have less than 5 recommendations, add random ones from the original list
  while (recommendations.length < 5) {
    const randomMovie = SAMPLE_RECOMMENDATIONS[Math.floor(Math.random() * SAMPLE_RECOMMENDATIONS.length)];
    if (!recommendations.find(m => m.title === randomMovie.title)) {
      recommendations.push(randomMovie);
    }
  }

  // If we have more than 5, take only the first 5
  return recommendations.slice(0, 5);
};
