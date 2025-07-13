import { getGenreCompatibilityScore } from "@/components/quiz/utils/genreMatching";

export async function calculateGenreScore(movieGenres: string, userGenres: string) {
  const { score, explanation } = await getGenreCompatibilityScore(movieGenres, userGenres);
  return {
    score,
    explanation,
    weight: 0.3 // 30% weight for genre matching
  };
}