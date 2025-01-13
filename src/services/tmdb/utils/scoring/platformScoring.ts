import { getPlatformScore } from "@/components/quiz/utils/platformMatching";

export async function calculatePlatformScore(platform: string) {
  const { score, explanation } = await getPlatformScore(platform);
  return {
    score,
    explanation,
    weight: 0.2 // 20% weight for platform availability
  };
}