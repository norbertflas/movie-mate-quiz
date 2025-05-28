
// =============================================================================
// 3. GAMIFICATION TYPES
// =============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'movies_watched' | 'genres_explored' | 'social' | 'streak' | 'rating' | 'special';
  requirement: {
    type: string;
    target: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  };
  reward: {
    xp: number;
    badge: string;
    title?: string;
    unlocks?: string[]; // Unlock other features
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress: number; // 0-1
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalMoviesWatched: number;
  totalHoursWatched: number;
  genresExplored: string[];
  currentStreak: number;
  longestStreak: number;
  averageRating: number;
  totalRatings: number;
  socialInteractions: number;
  achievements: Achievement[];
  badges: string[];
  titles: string[];
  currentTitle?: string;
  rank: {
    global: number;
    monthly: number;
    category: Record<string, number>; // genre -> rank
  };
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'individual' | 'community' | 'club';
  requirement: {
    action: 'watch' | 'rate' | 'review' | 'social' | 'streak';
    target: number;
    criteria?: {
      genre?: string;
      year?: number;
      rating?: number;
      duration?: number;
    };
  };
  reward: {
    xp: number;
    badges?: string[];
    specialReward?: string;
  };
  startDate: Date;
  endDate: Date;
  participants: number;
  completions: number;
  userProgress?: number; // 0-1
  isCompleted?: boolean;
}

export interface Leaderboard {
  type: 'global' | 'monthly' | 'genre' | 'club';
  category: string;
  entries: {
    rank: number;
    userId: string;
    userName: string;
    userAvatar: string;
    score: number;
    change: number; // rank change since last period
    stats: Record<string, any>;
  }[];
  lastUpdated: Date;
}
