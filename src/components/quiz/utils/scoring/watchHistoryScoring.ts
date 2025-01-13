import { getWatchHistoryScore } from "../watchHistory";

export async function calculateWatchHistoryScore(movieId: number) {
  const { score, explanation } = await getWatchHistoryScore(movieId);
  return {
    score,
    explanation,
    weight: 0.15 // 15% weight for watch history
  };
}