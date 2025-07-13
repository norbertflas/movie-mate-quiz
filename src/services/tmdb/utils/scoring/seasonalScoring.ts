import { getMovieKeywords } from "@/services/tmdb";

export async function calculateSeasonalScore(movieId: number) {
  const currentMonth = new Date().getMonth();
  const keywords = await getMovieKeywords(movieId);
  
  const isWinter = currentMonth >= 11 || currentMonth <= 1;
  const isSummer = currentMonth >= 5 && currentMonth <= 7;
  
  const hasSeasonalKeywords = isWinter ? 
    keywords.some(k => ['christmas', 'winter', 'snow', 'holiday'].includes(k.toLowerCase())) :
    isSummer ? 
    keywords.some(k => ['summer', 'beach', 'vacation'].includes(k.toLowerCase())) :
    false;

  return {
    score: hasSeasonalKeywords ? 1 : 0,
    explanation: hasSeasonalKeywords ? `Matches current season: ${isWinter ? 'Winter' : 'Summer'}` : '',
    weight: 0.15 // 15% weight for seasonal relevance
  };
}