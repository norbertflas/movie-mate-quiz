
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, Star, Zap, Crown, Gift, Award, Target, Users, 
  Calendar, CheckCircle, ChevronUp, ChevronDown, Play, 
  Clock, Flame 
} from "lucide-react";
import { UserStats, Challenge, Leaderboard } from "../types/GamificationTypes";
import { AchievementSystem } from "../engines/AchievementSystem";

interface GamificationDashboardProps {
  userStats: UserStats;
  challenges: Challenge[];
  leaderboards: Leaderboard[];
  onClaimReward: (achievementId: string) => void;
  onJoinChallenge: (challengeId: string) => void;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userStats,
  challenges,
  leaderboards,
  onClaimReward,
  onJoinChallenge
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboards'>('overview');

  const unclaimedAchievements = userStats.achievements.filter(a => a.unlockedAt && !a.reward.badge);
  const progressXP = ((userStats.xpToNextLevel - (AchievementSystem.calculateXPForLevel(userStats.level + 1) - userStats.xp)) / AchievementSystem.calculateXPForLevel(userStats.level + 1)) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Level and XP */}
      <Card className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {userStats.level}
                </div>
                <div className="absolute -top-2 -right-2">
                  <Crown className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">Level {userStats.level}</h2>
                {userStats.currentTitle && (
                  <p className="text-purple-100">"{userStats.currentTitle}"</p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">{userStats.xp.toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">{userStats.achievements.filter(a => a.unlockedAt).length} Achievements</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm">Global Rank</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  #{userStats.rank.global.toLocaleString()}
                </Badge>
              </div>
              <div className="w-48">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to Level {userStats.level + 1}</span>
                  <span>{userStats.xpToNextLevel} XP</span>
                </div>
                <Progress value={progressXP} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{userStats.totalMoviesWatched}</div>
            <div className="text-sm text-muted-foreground">Movies Watched</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{Math.round(userStats.totalHoursWatched)}</div>
            <div className="text-sm text-muted-foreground">Hours Watched</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{userStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{userStats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Unclaimed Rewards Alert */}
      {unclaimedAchievements.length > 0 && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    You have {unclaimedAchievements.length} unclaimed rewards!
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Click to claim your achievements and earn XP.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('achievements')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Claim Rewards
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">
            Achievements
            {unclaimedAchievements.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {unclaimedAchievements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.achievements
                    .filter(a => a.unlockedAt)
                    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
                    .slice(0, 5)
                    .map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}>
                          +{achievement.reward.xp} XP
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenges
                    .filter(c => !c.isCompleted && new Date() < c.endDate)
                    .slice(0, 5)
                    .map((challenge) => (
                      <div key={challenge.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{challenge.name}</h4>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                          <Badge variant="outline">{challenge.type}</Badge>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.round((challenge.userProgress || 0) * 100)}%</span>
                          </div>
                          <Progress value={(challenge.userProgress || 0) * 100} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Ends: {challenge.endDate.toLocaleDateString()}
                          </span>
                          <span className="font-medium">+{challenge.reward.xp} XP</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AchievementSystem.defaultAchievements.map((achievement) => {
              const isUnlocked = achievement.unlockedAt;
              const isNew = achievement.unlockedAt && !achievement.reward.badge; // Simplified check

              return (
                <Card 
                  key={achievement.id} 
                  className={`relative ${isUnlocked ? 'border-green-500' : 'opacity-60'} ${isNew ? 'ring-2 ring-yellow-500' : ''}`}
                >
                  {isNew && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-yellow-500 text-white animate-pulse">
                        NEW!
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress * 100)}%</span>
                      </div>
                      <Progress value={achievement.progress * 100} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant={
                        achievement.rarity === 'legendary' ? 'default' :
                        achievement.rarity === 'epic' ? 'secondary' :
                        achievement.rarity === 'rare' ? 'outline' : 'secondary'
                      }>
                        {achievement.rarity}
                      </Badge>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">+{achievement.reward.xp} XP</div>
                        {achievement.reward.title && (
                          <div className="text-xs text-muted-foreground">"{achievement.reward.title}"</div>
                        )}
                      </div>
                    </div>

                    {isNew && (
                      <Button 
                        className="w-full mt-3 bg-green-600 hover:bg-green-700"
                        onClick={() => onClaimReward(achievement.id)}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Claim Reward
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          {/* Challenge content here */}
          <Card>
            <CardHeader>
              <CardTitle>Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Challenge system implementation...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboards" className="mt-6">
          {/* Leaderboard content here */}
          <Card>
            <CardHeader>
              <CardTitle>Leaderboards</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Leaderboard system implementation...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
