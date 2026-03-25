
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, Users, 
  Trophy, Star, Laugh, Zap, Heart, Brain, Film, Tv, BookOpen, Clapperboard,
  Sofa, PartyPopper, Baby, Monitor, MessageCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { UserStats, Challenge } from "./types/GamificationTypes";
import { UserProfile } from "./types/MLTypes";
import { Movie } from "@/types/movie";
import { GamificationDashboard } from "./gamification/GamificationDashboard";
import { AchievementSystem } from "./engines/AchievementSystem";

interface EnhancedQuizProps {
  onBack?: () => void;
  onComplete?: (results: any) => void;
  userPreferences?: any;
}

interface QuizStep {
  id: string;
  question: string;
  type: "single" | "multiple" | "rating";
  options: { label: string; icon: React.ReactNode; }[];
  category: 'basic' | 'preferences' | 'social' | 'gamification';
}

const quizSteps: QuizStep[] = [
  {
    id: 'content_type',
    question: 'What type of content do you enjoy?',
    type: 'single',
    options: [
      { label: 'Movies', icon: <Film className="w-10 h-10" /> },
      { label: 'TV Series', icon: <Tv className="w-10 h-10" /> },
      { label: 'Documentaries', icon: <BookOpen className="w-10 h-10" /> },
      { label: 'Mixed Content', icon: <Clapperboard className="w-10 h-10" /> },
    ],
    category: 'basic'
  },
  {
    id: 'mood_preference',
    question: 'What is your current mood?',
    type: 'single',
    options: [
      { label: 'Need a laugh', icon: <Laugh className="w-10 h-10" /> },
      { label: 'Edge of my seat', icon: <Zap className="w-10 h-10" /> },
      { label: 'Something romantic', icon: <Heart className="w-10 h-10" /> },
      { label: 'Mind-bending', icon: <Brain className="w-10 h-10" /> },
    ],
    category: 'preferences'
  },
  {
    id: 'social_watching',
    question: 'How do you like to watch?',
    type: 'single',
    options: [
      { label: 'Solo binge sessions', icon: <Sofa className="w-10 h-10" /> },
      { label: 'Movie nights with friends', icon: <PartyPopper className="w-10 h-10" /> },
      { label: 'Family time', icon: <Baby className="w-10 h-10" /> },
      { label: 'Online watch parties', icon: <Monitor className="w-10 h-10" /> },
    ],
    category: 'social'
  },
  {
    id: 'challenge_interest',
    question: 'Are you up for challenges?',
    type: 'single',
    options: [
      { label: 'Yes! I love challenges', icon: <Trophy className="w-10 h-10" /> },
      { label: 'Maybe some light goals', icon: <Star className="w-10 h-10" /> },
      { label: 'Just recommendations', icon: <Sparkles className="w-10 h-10" /> },
      { label: 'Not interested', icon: <MessageCircle className="w-10 h-10" /> },
    ],
    category: 'gamification'
  },
  {
    id: 'genre_rating',
    question: 'Rate your genre preferences',
    type: 'rating',
    options: [
      { label: 'Action & Adventure', icon: <Zap className="w-5 h-5" /> },
      { label: 'Comedy', icon: <Laugh className="w-5 h-5" /> },
      { label: 'Drama', icon: <Film className="w-5 h-5" /> },
      { label: 'Horror & Thriller', icon: <Brain className="w-5 h-5" /> },
      { label: 'Science Fiction', icon: <Sparkles className="w-5 h-5" /> },
      { label: 'Romance', icon: <Heart className="w-5 h-5" /> },
      { label: 'Documentary', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Animation', icon: <Clapperboard className="w-5 h-5" /> },
    ],
    category: 'preferences'
  }
];

const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({ onBack, onComplete, userPreferences = {} }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);

  const [userStats] = useState<UserStats>({
    level: 5, xp: 2750, xpToNextLevel: 450, totalMoviesWatched: 147, totalHoursWatched: 312.5,
    genresExplored: ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Romance'],
    currentStreak: 12, longestStreak: 28, averageRating: 4.2, totalRatings: 134, socialInteractions: 67,
    achievements: AchievementSystem.defaultAchievements, badges: ['newcomer', 'explorer', 'social'],
    titles: ['Movie Enthusiast', 'Genre Explorer'], currentTitle: 'Movie Enthusiast',
    rank: { global: 1247, monthly: 89, category: { Action: 456, Drama: 234 } }
  });

  const [challenges] = useState<Challenge[]>([{
    id: 'daily_watch', name: 'Daily Movie Challenge', description: 'Watch one movie every day this week',
    type: 'daily', category: 'individual', requirement: { action: 'watch', target: 7, criteria: { duration: 90 } },
    reward: { xp: 200, badges: ['dedicated'] }, startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), participants: 1247, completions: 89, userProgress: 0.4
  }]);

  const currentQuizStep = quizSteps[currentStep];
  const totalSteps = quizSteps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswerChange = (stepId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [stepId]: answer }));
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuizStep.id];
    if (!currentAnswer && currentQuizStep.type !== 'rating') {
      toast({ title: "Please select an answer", description: "Choose an option before continuing.", variant: "destructive" });
      return;
    }
    if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
    else onBack?.();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const processedResults = {
        answers,
        recommendations: [{
          id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          backdrop_path: "/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg",
          overview: "A depressed man suffering from insomnia meets a strange soap salesman.",
          release_date: "1999-10-15", vote_average: 8.4, runtime: 139, genres: ["Drama", "Thriller"]
        }] as Movie[],
        socialFeatures: false, gamificationEnabled: false
      };
      setRecommendations(processedResults.recommendations);
      setShowResults(true);
      onComplete?.(processedResults);
      toast({ title: "Quiz completed! 🎉", description: "Your personalized recommendations are ready." });
    } catch { toast({ title: "Something went wrong", variant: "destructive" }); }
    finally { setIsSubmitting(false); }
  };

  if (showResults) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30">
            <Check className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-gradient-neon mb-2">Quiz Complete! 🎉</h2>
          <p className="text-muted-foreground">Your personalized movie experience is ready</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Sparkles className="w-10 h-10 text-neon-purple" />, title: "Recommendations", desc: `${recommendations.length} movies ready` },
            { icon: <Users className="w-10 h-10 text-accent" />, title: "Social Features", desc: "Coming soon" },
            { icon: <Trophy className="w-10 h-10 text-yellow-400" />, title: "Achievements", desc: "View Dashboard" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="neon-card p-6 text-center cursor-pointer hover:border-primary/60 transition-all">
              <div className="mx-auto mb-3">{card.icon}</div>
              <h3 className="text-foreground font-semibold mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Progress */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Question {currentStep + 1} of {totalSteps}</p>
        <div className="relative h-2 w-full rounded-full bg-secondary/50 border border-border/20 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))' }}
            initial={false}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* Glowing dot at end */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent shadow-lg shadow-accent/50 border-2 border-white/30"
            initial={false}
            animate={{ left: `calc(${progressPercentage}% - 8px)` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}>
          
          {/* Question */}
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 text-gradient-neon">
            {currentQuizStep.question}
          </h2>

          {/* Options */}
          {(currentQuizStep.type === 'single' || currentQuizStep.type === 'multiple') && (
            <div className="grid grid-cols-2 gap-5 max-w-3xl mx-auto">
              {currentQuizStep.options.map((option, index) => {
                const isSelected = answers[currentQuizStep.id] === option.label;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAnswerChange(currentQuizStep.id, option.label)}
                    className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 min-h-[160px] ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                        : 'border-border/40 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50'
                    }`}>
                    <div className={`transition-colors ${isSelected ? 'text-accent' : 'text-neon-cyan'}`}>
                      {option.icon}
                    </div>
                    <span className={`text-lg font-semibold ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Rating */}
          {currentQuizStep.type === 'rating' && (
            <div className="space-y-3 max-w-2xl mx-auto">
              {currentQuizStep.options.map((genre, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 border border-border/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-accent">{genre.icon}</span>
                    <span className="text-foreground font-medium">{genre.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button key={rating} className="p-1" onClick={() => {
                        const cur = answers[currentQuizStep.id] || {};
                        handleAnswerChange(currentQuizStep.id, { ...cur, [genre.label]: rating });
                      }}>
                        <Star className={`w-5 h-5 transition-colors ${
                          (answers[currentQuizStep.id]?.[genre.label] || 0) >= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/40'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-10 max-w-3xl mx-auto">
        <Button variant="outline" size="lg" onClick={handlePrevious} disabled={isSubmitting}
          className="rounded-xl px-8 border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button size="lg" onClick={handleNext} disabled={isSubmitting}
          className="rounded-xl px-8 btn-gradient">
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </div>
          ) : currentStep === totalSteps - 1 ? (
            <>Complete Quiz <Check className="w-4 h-4 ml-2" /></>
          ) : (
            <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedQuiz;
