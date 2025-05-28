
import { UserProfile, MLRecommendation } from "../types/MLTypes";

// Collaborative Filtering Engine
export const CollaborativeFilteringEngine = {
  // Calculate user similarity using Cosine Similarity
  calculateUserSimilarity: (user1: UserProfile, user2: UserProfile): number => {
    const commonMovies = Object.keys(user1.ratings).filter(movieId => 
      movieId in user2.ratings
    );

    if (commonMovies.length < 3) return 0; // Minimum 3 common ratings

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const movieId of commonMovies) {
      const rating1 = user1.ratings[parseInt(movieId)];
      const rating2 = user2.ratings[parseInt(movieId)];
      
      dotProduct += rating1 * rating2;
      normA += rating1 * rating1;
      normB += rating2 * rating2;
    }

    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  // Find similar users
  findSimilarUsers: (targetUser: UserProfile, allUsers: UserProfile[]): UserProfile['similarUsers'] => {
    return allUsers
      .filter(user => user.id !== targetUser.id)
      .map(user => ({
        userId: user.id,
        similarity: CollaborativeFilteringEngine.calculateUserSimilarity(targetUser, user),
        sharedRatings: Object.keys(targetUser.ratings).filter(movieId => 
          movieId in user.ratings
        ).length
      }))
      .filter(sim => sim.similarity > 0.1 && sim.sharedRatings >= 3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50); // Top 50 similar users
  },

  // Generate collaborative recommendations
  generateCollaborativeRecommendations: (
    targetUser: UserProfile, 
    similarUsers: UserProfile[], 
    allMovies: number[]
  ): MLRecommendation[] => {
    const recommendations: Record<number, { score: number; userProfiles: string[] }> = {};
    
    // For each similar user
    for (const similarUser of targetUser.similarUsers.slice(0, 20)) {
      const user = similarUsers.find(u => u.id === similarUser.userId);
      if (!user) continue;

      // Find movies that similar user liked, but target hasn't seen
      for (const [movieIdStr, rating] of Object.entries(user.ratings)) {
        const movieId = parseInt(movieIdStr);
        
        // Skip if target user already rated this movie
        if (movieId in targetUser.ratings) continue;
        
        // Only consider well-rated movies (4+ stars)
        if (rating < 4) continue;

        if (!recommendations[movieId]) {
          recommendations[movieId] = { score: 0, userProfiles: [] };
        }

        // Weight by user similarity and rating
        const weight = similarUser.similarity * (rating / 5);
        recommendations[movieId].score += weight;
        recommendations[movieId].userProfiles.push(user.id);
      }
    }

    // Convert to MLRecommendation format
    return Object.entries(recommendations)
      .map(([movieIdStr, data]) => ({
        movieId: parseInt(movieIdStr),
        score: Math.min(data.score, 1), // Normalize to 0-1
        reasons: {
          collaborative: data.score,
          contentBased: 0,
          trending: 0,
          diversity: 0
        },
        explanation: [
          `${data.userProfiles.length} similar users loved this`,
          'Based on your viewing patterns'
        ],
        confidence: Math.min(data.score * 0.8, 0.95),
        userProfiles: data.userProfiles.slice(0, 5)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
  }
};
