
import { Achievement, UserStats } from "../types/GamificationTypes";

export const AchievementSystem = {
  // Predefined achievements
  defaultAchievements: [
    {
      id: 'first_movie',
      name: 'First Watch',
      description: 'Watch your first movie',
      icon: '🎬',
      type: 'movies_watched',
      requirement: { type: 'movies_watched', target: 1 },
      reward: { xp: 50, badge: 'newcomer' },
      rarity: 'common',
      progress: 0
    },
    {
      id: 'movie_marathon',
      name: 'Movie Marathon',
      description: 'Watch 10 movies in a single day',
      icon: '🍿',
      type: 'movies_watched',
      requirement: { type: 'movies_watched_daily', target: 10, timeframe: 'daily' },
      reward: { xp: 500, badge: 'marathoner', title: 'The Binge Watcher' },
      rarity: 'epic',
      progress: 0
    },
    {
      id: 'genre_explorer',
      name: 'Genre Explorer',
      description: 'Watch movies from 15 different genres',
      icon: '🎭',
      type: 'genres_explored',
      requirement: { type: 'unique_genres', target: 15 },
      reward: { xp: 300, badge: 'explorer' },
      rarity: 'rare',
      progress: 0
    },
    {
      id: 'critic',
      name: 'Professional Critic',
      description: 'Write 100 detailed reviews',
      icon: '✍️',
      type: 'rating',
      requirement: { type: 'reviews_written', target: 100 },
      reward: { xp: 1000, badge: 'critic', title: 'Movie Critic' },
      rarity: 'epic',
      progress: 0
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Participate in 50 discussions',
      icon: '🦋',
      type: 'social',
      requirement: { type: 'discussions_participated', target: 50 },
      reward: { xp: 400, badge: 'social' },
      rarity: 'rare',
      progress: 0
    },
    {
      id: 'streak_master',
      name: 'Dedication Master',
      description: 'Maintain a 30-day watching streak',
      icon: '🔥',
      type: 'streak',
      requirement: { type: 'daily_streak', target: 30 },
      reward: { xp: 800, badge: 'dedicated', title: 'Streak Master' },
      rarity: 'epic',
      progress: 0
    }
  ] as Achievement[],

  // Check achievement progress
  checkAchievements: (userStats: UserStats, userActivity: any): Achievement[] => {
    const newAchievements: Achievement[] = [];

    for (const achievement of AchievementSystem.defaultAchievements) {
      if (achievement.unlockedAt) continue; // Already unlocked

      const progress = AchievementSystem.calculateProgress(achievement, userStats, userActivity);
      achievement.progress = progress;

      if (progress >= 1 && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date();
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  },

  calculateProgress: (achievement: Achievement, userStats: UserStats, userActivity: any): number => {
    switch (achievement.requirement.type) {
      case 'movies_watched':
        return Math.min(userStats.totalMoviesWatched / achievement.requirement.target, 1);
      
      case 'unique_genres':
        return Math.min(userStats.genresExplored.length / achievement.requirement.target, 1);
      
      case 'daily_streak':
        return Math.min(userStats.currentStreak / achievement.requirement.target, 1);
      
      case 'reviews_written':
        return Math.min((userActivity.reviewsWritten || 0) / achievement.requirement.target, 1);
      
      case 'discussions_participated':
        return Math.min(userStats.socialInteractions / achievement.requirement.target, 1);
      
      default:
        return 0;
    }
  },

  // Calculate XP needed for next level
  calculateXPForLevel: (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  },

  // Calculate level based on XP
  calculateLevel: (totalXP: number): { level: number; xpToNext: number } => {
    let level = 1;
    let xpForLevel = 100;
    let totalXPRequired = 0;

    while (totalXPRequired + xpForLevel <= totalXP) {
      totalXPRequired += xpForLevel;
      level++;
      xpForLevel = AchievementSystem.calculateXPForLevel(level);
    }

    return {
      level,
      xpToNext: xpForLevel - (totalXP - totalXPRequired)
    };
  }
};
