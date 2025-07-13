
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, Users, Play, 
  Trophy, Target, Gift, Clock, Star, Zap
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

// Import our new types and engines
import { UserStats, Achievement, Challenge } from "./types/GamificationTypes";
import { WatchParty, MovieClub } from "./types/SocialTypes";
import { UserProfile, MLRecommendation } from "./types/MLTypes";
import { Movie } from "@/types/movie";

// Import components
import { GamificationDashboard } from "./gamification/GamificationDashboard";
import { WatchPartyComponent } from "./social/WatchPartyComponent";
import { MovieClubCard } from "./social/MovieClubCard";

// Import engines
import { AchievementSystem } from "./engines/AchievementSystem";
import { CollaborativeFilteringEngine } from "./engines/CollaborativeFilteringEngine";
import { ContentBasedEngine } from "./engines/ContentBasedEngine";
import { HybridRecommendationEngine } from "./engines/HybridRecommendationEngine";

interface EnhancedQuizProps {
  onBack?: () => void;
  onComplete?: (results: any) => void;
  userPreferences?: any;
}

interface QuizStep {
  id: string;
  title: string;
  subtitle?: string;
  question: string;
  type: "single" | "multiple" | "slider" | "rating";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  category: 'basic' | 'preferences' | 'social' | 'gamification';
}

const quizSteps: QuizStep[] = [
  {
    id: 'content_type',
    title: 'What type of content do you enjoy?',
    subtitle: 'Help us understand your viewing preferences',
    question: 'What do you prefer to watch?',
    type: 'single',
    options: ['Movies', 'TV Series', 'Documentaries', 'Short Films', 'Mixed Content'],
    category: 'basic'
  },
  {
    id: 'mood_preference',
    title: 'What mood are you in?',
    subtitle: 'Let us match your current vibe',
    question: 'How are you feeling today?',
    type: 'single',
    options: [
      'Want to laugh 😄',
      'Need something touching 💕', 
      'Craving adrenaline ⚡',
      'Want to relax 😌',
      'Need to think 🤔',
      'Want to escape 🌟'
    ],
    category: 'preferences'
  },
  {
    id: 'social_watching',
    title: 'How do you like to watch?',
    subtitle: 'Discover social features',
    question: 'What\'s your ideal viewing experience?',
    type: 'single',
    options: [
      'Solo binge sessions 🧘',
      'Movie nights with friends 👥',
      'Family time 👨‍👩‍👧‍👦',
      'Online watch parties 💻',
      'Movie club discussions 🎬'
    ],
    category: 'social'
  },
  {
    id: 'challenge_interest',
    title: 'Are you up for challenges?',
    subtitle: 'Gamify your movie experience',
    question: 'Would you like to earn achievements and compete?',
    type: 'single',
    options: [
      'Yes! I love challenges 🏆',
      'Maybe some light goals 🎯',
      'Just recommendations please 🎬',
      'Not interested in gamification ❌'
    ],
    category: 'gamification'
  },
  {
    id: 'genre_rating',
    title: 'Rate your genre preferences',
    subtitle: 'Help us fine-tune recommendations',
    question: 'How much do you enjoy these genres? (1-5 stars)',
    type: 'rating',
    options: [
      'Action & Adventure',
      'Comedy',
      'Drama',
      'Horror & Thriller',
      'Science Fiction',
      'Romance',
      'Documentary',
      'Animation'
    ],
    category: 'preferences'
  }
];

const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({ 
  onBack, 
  onComplete, 
  userPreferences = {} 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Quiz state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Enhanced features state
  const [showGamification, setShowGamification] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  
  // Mock data for demonstration
  const [userStats] = useState<UserStats>({
    level: 5,
    xp: 2750,
    xpToNextLevel: 450,
    totalMoviesWatched: 147,
    totalHoursWatched: 312.5,
    genresExplored: ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Romance'],
    currentStreak: 12,
    longestStreak: 28,
    averageRating: 4.2,
    totalRatings: 134,
    socialInteractions: 67,
    achievements: AchievementSystem.defaultAchievements,
    badges: ['newcomer', 'explorer', 'social'],
    titles: ['Movie Enthusiast', 'Genre Explorer'],
    currentTitle: 'Movie Enthusiast',
    rank: {
      global: 1247,
      monthly: 89,
      category: { Action: 456, Drama: 234 }
    }
  });

  const [challenges] = useState<Challenge[]>([
    {
      id: 'daily_watch',
      name: 'Daily Movie Challenge',
      description: 'Watch one movie every day this week',
      type: 'daily',
      category: 'individual',
      requirement: {
        action: 'watch',
        target: 7,
        criteria: { duration: 90 }
      },
      reward: { xp: 200, badges: ['dedicated'] },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      participants: 1247,
      completions: 89,
      userProgress: 0.4
    }
  ]);

  const currentQuizStep = quizSteps[currentStep];
  const totalSteps = quizSteps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswerChange = (stepId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [stepId]: answer
    }));
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuizStep.id];
    
    if (!currentAnswer && currentQuizStep.type !== 'rating') {
      toast({
        title: "Please select an answer",
        description: "Choose an option before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack?.();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process answers and generate recommendations
      const processedResults = {
        answers,
        recommendations: generateMockRecommendations(),
        userProfile: generateUserProfile(),
        socialFeatures: answers.social_watching?.includes('party') || answers.social_watching?.includes('club'),
        gamificationEnabled: answers.challenge_interest?.includes('Yes') || answers.challenge_interest?.includes('Maybe')
      };
      
      setRecommendations(processedResults.recommendations);
      setShowGamification(processedResults.gamificationEnabled);
      setShowSocial(processedResults.socialFeatures);
      setShowResults(true);
      
      onComplete?.(processedResults);
      
      toast({
        title: "Quiz completed! 🎉",
        description: "Your personalized recommendations are ready.",
      });
      
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateMockRecommendations = (): Movie[] => {
    return [
      {
        id: 550,
        title: "Fight Club",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        backdrop_path: "/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg",
        overview: "A depressed man (Edward Norton) suffering from insomnia meets a strange soap salesman named Tyler Durden (Brad Pitt) and soon finds himself living in his squalid house after his perfect apartment is destroyed.",
        release_date: "1999-10-15",
        vote_average: 8.4,
        runtime: 139,
        genres: ["Drama", "Thriller"]
      }
    ];
  };

  const generateUserProfile = (): UserProfile => {
    return {
      id: 'user-123',
      preferences: {
        genres: {
          'Action': 0.8,
          'Drama': 0.9,
          'Comedy': 0.6
        },
        directors: {},
        actors: {},
        decades: {},
        languages: { 'en': 1.0 },
        runtimes: { min: 90, max: 180, preferred: 120 }
      },
      ratings: {},
      watchHistory: [],
      similarUsers: [],
      lastUpdated: new Date()
    };
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Complete! 🎉</h2>
          <p className="text-muted-foreground">
            Your personalized movie experience is ready
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered suggestions based on your preferences
              </p>
              <Badge variant="secondary">{recommendations.length} movies ready</Badge>
            </CardContent>
          </Card>

          {showSocial && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Social Features</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch parties, movie clubs, and discussions
                </p>
                <Badge variant="secondary">Coming soon</Badge>
              </CardContent>
            </Card>
          )}

          {showGamification && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShowGamification(true)}
            >
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Achievements & Challenges</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Earn XP, unlock badges, and compete
                </p>
                <Badge variant="secondary">View Dashboard</Badge>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gamification Dashboard Modal */}
        {showGamification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Gamification Dashboard</h2>
                <Button variant="outline" onClick={() => setShowGamification(false)}>
                  Close
                </Button>
              </div>
              <GamificationDashboard
                userStats={userStats}
                challenges={challenges}
                leaderboards={[]}
                onClaimReward={(id) => console.log('Claim reward:', id)}
                onJoinChallenge={(id) => console.log('Join challenge:', id)}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">
                Step {currentStep + 1} of {totalSteps}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {currentQuizStep.category}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="mb-4" />
            <CardTitle className="text-xl">{currentQuizStep.title}</CardTitle>
            {currentQuizStep.subtitle && (
              <p className="text-muted-foreground">{currentQuizStep.subtitle}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <h3 className="font-medium text-lg">{currentQuizStep.question}</h3>

            {/* Single/Multiple Choice */}
            {(currentQuizStep.type === 'single' || currentQuizStep.type === 'multiple') && (
              <div className="space-y-3">
                {currentQuizStep.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={answers[currentQuizStep.id] === option ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleAnswerChange(currentQuizStep.id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

            {/* Rating */}
            {currentQuizStep.type === 'rating' && (
              <div className="space-y-4">
                {currentQuizStep.options?.map((genre, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{genre}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => {
                            const currentRatings = answers[currentQuizStep.id] || {};
                            handleAnswerChange(currentQuizStep.id, {
                              ...currentRatings,
                              [genre]: rating
                            });
                          }}
                        >
                          <Star 
                            className={`w-5 h-5 ${
                              (answers[currentQuizStep.id]?.[genre] || 0) >= rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 0 ? 'Back' : 'Previous'}
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </div>
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    Complete Quiz
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EnhancedQuiz;
