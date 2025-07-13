
// =============================================================================
// 2. MACHINE LEARNING TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  preferences: {
    genres: Record<string, number>; // genre -> preference score 0-1
    directors: Record<string, number>;
    actors: Record<string, number>;
    decades: Record<string, number>;
    languages: Record<string, number>;
    runtimes: {
      min: number;
      max: number;
      preferred: number;
    };
  };
  ratings: Record<number, number>; // movieId -> rating 1-5
  watchHistory: {
    movieId: number;
    watchedAt: Date;
    completionPercentage: number;
    rating?: number;
    rewatched: boolean;
  }[];
  similarUsers: {
    userId: string;
    similarity: number; // 0-1
    sharedRatings: number;
  }[];
  lastUpdated: Date;
}

export interface MovieEmbedding {
  movieId: number;
  embedding: number[]; // 128-dimensional vector
  tags: string[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  popularity: {
    trending: number; // 0-1
    seasonal: number; // 0-1
    viral: number; // 0-1
  };
  lastUpdated: Date;
}

export interface MLRecommendation {
  movieId: number;
  score: number; // 0-1
  reasons: {
    collaborative: number; // similarity to other users
    contentBased: number; // content similarity
    trending: number; // popularity boost
    diversity: number; // diversity factor
  };
  explanation: string[];
  confidence: number; // 0-1
  userProfiles: string[]; // similar users who liked this
}
