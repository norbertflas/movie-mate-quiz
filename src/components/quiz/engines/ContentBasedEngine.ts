
import { UserProfile, MovieEmbedding, MLRecommendation } from "../types/MLTypes";

// Content-Based Filtering with Deep Learning Embeddings
export const ContentBasedEngine = {
  // Calculate movie similarity based on embeddings
  calculateMovieSimilarity: (movie1: MovieEmbedding, movie2: MovieEmbedding): number => {
    if (movie1.embedding.length !== movie2.embedding.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < movie1.embedding.length; i++) {
      dotProduct += movie1.embedding[i] * movie2.embedding[i];
      normA += movie1.embedding[i] * movie1.embedding[i];
      normB += movie2.embedding[i] * movie2.embedding[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  // Generate user embedding based on history
  generateUserEmbedding: (user: UserProfile, movieEmbeddings: MovieEmbedding[]): number[] => {
    const embedding = new Array(128).fill(0);
    let totalWeight = 0;

    // Weight movies by rating and recency
    for (const [movieIdStr, rating] of Object.entries(user.ratings)) {
      const movieId = parseInt(movieIdStr);
      const movieEmbedding = movieEmbeddings.find(m => m.movieId === movieId);
      if (!movieEmbedding) continue;

      const weight = rating / 5; // Normalize rating to 0-1
      totalWeight += weight;

      for (let i = 0; i < embedding.length; i++) {
        embedding[i] += movieEmbedding.embedding[i] * weight;
      }
    }

    // Normalize
    if (totalWeight > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= totalWeight;
      }
    }

    return embedding;
  },

  // Content-based recommendations
  generateContentBasedRecommendations: (
    userEmbedding: number[],
    movieEmbeddings: MovieEmbedding[],
    userRatings: Record<number, number>
  ): MLRecommendation[] => {
    const userEmbeddingObj = { 
      movieId: -1, 
      embedding: userEmbedding, 
      tags: [], 
      sentiment: { positive: 0, negative: 0, neutral: 0 }, 
      popularity: { trending: 0, seasonal: 0, viral: 0 }, 
      lastUpdated: new Date() 
    };

    return movieEmbeddings
      .filter(movie => !(movie.movieId in userRatings)) // Skip already rated
      .map(movie => {
        const similarity = ContentBasedEngine.calculateMovieSimilarity(userEmbeddingObj, movie);
        
        return {
          movieId: movie.movieId,
          score: similarity,
          reasons: {
            collaborative: 0,
            contentBased: similarity,
            trending: movie.popularity.trending * 0.1,
            diversity: 0
          },
          explanation: [
            'Matches your content preferences',
            `Similar to movies you enjoyed`,
            ...(movie.popularity.trending > 0.7 ? ['Currently trending'] : [])
          ],
          confidence: similarity * 0.9,
          userProfiles: []
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
  }
};
