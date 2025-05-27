
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { PlayCircle, Film, Search, User, Sparkles, TrendingUp, Star, Clock, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { DynamicMovieBackground } from "./movie/DynamicMovieBackground";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
  isLoading?: boolean;
  userPreferences?: any;
  showPersonalizedContent?: boolean;
}

interface UserStats {
  moviesWatched: number;
  quizzesCompleted: number;
  favoriteGenres: string[];
  avgRating: number;
}

export const WelcomeSection = ({ 
  onStartQuiz, 
  isLoading = false,
  userPreferences = {},
  showPersonalizedContent = false
}: WelcomeSectionProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [userStats] = useLocalStorage<UserStats>('moviefinder_stats', {
    moviesWatched: 0,
    quizzesCompleted: 0,
    favoriteGenres: [],
    avgRating: 0
  });

  // Enhanced testimonials data
  const testimonials = useMemo(() => [
    {
      name: "Sarah M.",
      avatar: "/avatars/sarah.jpg",
      rating: 5,
      text: "Found my new favorite director through this app! The recommendations are incredibly accurate.",
      moviesFound: 47
    },
    {
      name: "Alex K.",
      avatar: "/avatars/alex.jpg", 
      rating: 5,
      text: "As a film student, this has become my go-to resource for discovering hidden gems.",
      moviesFound: 83
    },
    {
      name: "Maria L.",
      avatar: "/avatars/maria.jpg",
      rating: 5,
      text: "The quiz actually understands my taste better than my friends do!",
      moviesFound: 29
    }
  ], []);

  // Auto-rotation
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 4000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(testimonialInterval);
    };
  }, [testimonials.length]);

  const handleQuizStart = useCallback(() => {
    try {
      Analytics.track('quiz_started', {
        source: 'welcome_section',
        user_type: showPersonalizedContent ? 'returning' : 'new',
        previous_completions: userStats.quizzesCompleted,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Analytics error:', error);
    }
    onStartQuiz();
  }, [onStartQuiz, showPersonalizedContent, userStats.quizzesCompleted]);

  const steps = useMemo(() => [
    {
      title: t("quiz.questions.platforms", "Choose Platforms"),
      subtitle: t("quiz.questions.platformsSubtitle", "Select your streaming services"),
      step: 1,
      color: "from-blue-600 to-blue-700",
      icon: <PlayCircle className="h-5 w-5" />,
      badge: "Popular",
      description: "Tell us your streaming preferences",
      completionTime: "30 seconds"
    },
    {
      title: t("search.movies", "Search Movies"),
      subtitle: t("search.placeholder", "Find any movie instantly"),
      step: 2,
      color: "from-purple-600 to-purple-700",
      icon: <Search className="h-5 w-5" />,
      badge: "Fast",
      description: "Find movies instantly with smart search",
      completionTime: "Real-time"
    },
    {
      title: t("creator.searchByCreator", "Find by Creator"),
      subtitle: t("creator.creatorDescription", "Discover by directors and actors"),
      step: 3,
      color: "from-pink-600 to-pink-700",
      icon: <User className="h-5 w-5" />,
      badge: "Smart",
      description: "Discover films by your favorite creators",
      completionTime: "Instant"
    }
  ], [t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div>
      <DynamicMovieBackground 
        className="rounded-xl min-h-[750px] relative overflow-hidden" 
        overlayOpacity={0.88} 
        variant="gradient" 
        rowCount={4} 
        speed="slow"
      >
        {/* Main container */}
        <motion.div 
          className="relative z-20 py-16 px-6 md:px-8 lg:px-12 flex flex-col items-center max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Personalized greeting for returning users */}
          {showPersonalizedContent && (
            <motion.div
              variants={itemVariants}
              className="mb-6 text-center"
            >
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                Welcome back! You've completed {userStats.quizzesCompleted} quiz{userStats.quizzesCompleted !== 1 ? 'es' : ''}
              </Badge>
            </motion.div>
          )}

          {/* Hero Icon */}
          <motion.div
            variants={itemVariants}
            className="relative mb-8"
          >
            <motion.div
              className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-full p-6 shadow-2xl relative"
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.6)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Film className="h-12 w-12 text-white relative z-10" />
            </motion.div>
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity, 
                ease: "linear"
              }}
            >
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </motion.div>
          </motion.div>
          
          {/* Enhanced Title */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-400 leading-tight">
                {showPersonalizedContent ? "Welcome Back!" : t("site.findYourMovie", "Find Your Perfect Movie")}
              </span>
            </h1>
            
            {/* Badges */}
            <motion.div
              className="flex items-center justify-center gap-3 mt-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending Now
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Users className="h-3 w-3 mr-1" />
                15K+ Users
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </motion.div>
          </motion.div>
          
          {/* Enhanced Subtitle */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-4">
              {showPersonalizedContent 
                ? "Ready for more personalized recommendations?"
                : t("site.exploreCollections", "Discover movies tailored to your taste")
              }
            </p>
            <p className="text-base text-gray-400 max-w-2xl">
              Join over 15,000+ movie lovers finding their perfect match with our AI-powered recommendation engine
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                onClick={handleQuizStart}
                disabled={isLoading}
                className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 rounded-xl shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:translate-y-[-3px] border-0 relative overflow-hidden"
              >
                <Film className="mr-3 h-6 w-6 relative z-10" />
                <span className="whitespace-nowrap relative z-10">
                  {isLoading ? "Starting..." : showPersonalizedContent ? "Take New Quiz" : t("quiz.start", "Start Quiz")}
                </span>
                {!isLoading && <Sparkles className="ml-2 h-4 w-4 relative z-10" />}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </DynamicMovieBackground>
    </div>
  );
};
