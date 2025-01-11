import { MovieRecommendation } from "./QuizTypes";
import { SAMPLE_RECOMMENDATIONS } from "./QuizConstants";

export const getRecommendations = (answers: Record<string, any>): MovieRecommendation[] => {
  let recommendations = [...SAMPLE_RECOMMENDATIONS];
  
  // Filtruj po wybranych serwisach VOD
  if (answers.vod && answers.vod.length > 0) {
    recommendations = recommendations.filter(movie => 
      answers.vod.includes(movie.platform)
    );
  }

  // Filtruj po gatunku
  if (answers.genre) {
    recommendations = recommendations.filter(movie => 
      movie.genre.toLowerCase() === answers.genre.toLowerCase()
    );
  }

  // Losowo wybierz 5 rekomendacji
  recommendations = recommendations.sort(() => Math.random() - 0.5).slice(0, 5);

  return recommendations;
};