
import { MLRecommendation } from "../types/MLTypes";

// Hybrid Recommendation System
export const HybridRecommendationEngine = {
  combineRecommendations: (
    collaborative: MLRecommendation[],
    contentBased: MLRecommendation[],
    trending: MLRecommendation[],
    weights: { collaborative: number; contentBased: number; trending: number; diversity: number }
  ): MLRecommendation[] => {
    const combined: Record<number, MLRecommendation> = {};

    // Combine all recommendations
    [...collaborative, ...contentBased, ...trending].forEach(rec => {
      if (!combined[rec.movieId]) {
        combined[rec.movieId] = { ...rec };
      } else {
        // Merge scores
        const existing = combined[rec.movieId];
        existing.reasons.collaborative = Math.max(existing.reasons.collaborative, rec.reasons.collaborative);
        existing.reasons.contentBased = Math.max(existing.reasons.contentBased, rec.reasons.contentBased);
        existing.reasons.trending = Math.max(existing.reasons.trending, rec.reasons.trending);
        
        // Combine explanations
        existing.explanation = [...new Set([...existing.explanation, ...rec.explanation])];
        existing.userProfiles = [...new Set([...existing.userProfiles, ...rec.userProfiles])];
      }
    });

    // Calculate final scores
    Object.values(combined).forEach(rec => {
      rec.score = (
        rec.reasons.collaborative * weights.collaborative +
        rec.reasons.contentBased * weights.contentBased +
        rec.reasons.trending * weights.trending
      );

      // Diversity penalty for too similar content
      rec.reasons.diversity = HybridRecommendationEngine.calculateDiversityScore(rec, Object.values(combined));
      rec.score *= (1 + rec.reasons.diversity * weights.diversity);

      rec.confidence = Math.min(rec.score * 0.85 + (rec.userProfiles.length * 0.02), 0.98);
    });

    return Object.values(combined)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  },

  calculateDiversityScore: (targetRec: MLRecommendation, allRecs: MLRecommendation[]): number => {
    // Promote diversity in recommendations
    // This is a simplified version - in practice you'd use genre, director, year etc.
    return Math.random() * 0.1; // Placeholder
  }
};
