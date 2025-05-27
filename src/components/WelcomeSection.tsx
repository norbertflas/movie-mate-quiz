
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "./ui/button";
import { PlayCircle, Film, Search, User, Sparkles, TrendingUp, Star, Clock, Users, ArrowRight, Zap } from "lucide-react";
import { motion, useInView, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { DynamicMovieBackground } from "./movie/DynamicMovieBackground";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
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
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [userStats] = useLocalStorage<UserStats>('moviefinder_stats', {
    moviesWatched: 0,
    quizzesCompleted: 0,
    favoriteGenres: [],
    avgRating: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const testimonialIntervalRef = useRef<NodeJS.Timeout>();
  const sectionRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  // Enhanced testimonials data
  const testimonials = [
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
  ];

  // Handle mouse movement for parallax effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  }, [mouseX, mouseY]);

  // Optimized auto-rotation with proper cleanup
  useEffect(() => {
    if (!isVisible) return;

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 4000);

    testimonialIntervalRef.current = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (testimonialIntervalRef.current) clearInterval(testimonialIntervalRef.current);
    };
  }, [isVisible, testimonials.length]);

  // Intersection observer for performance
  useEffect(() => {
    setIsVisible(isInView);
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleQuizStart = useCallback(() => {
    Analytics.track('quiz_started', {
      source: 'welcome_section',
      user_type: showPersonalizedContent ? 'returning' : 'new',
      previous_completions: userStats.quizzesCompleted,
      timestamp: new Date().toISOString()
    });
    onStartQuiz();
  }, [onStartQuiz, showPersonalizedContent, userStats.quizzesCompleted]);

  const steps = useMemo(() => [
    {
      title: t("quiz.questions.platforms"),
      subtitle: t("quiz.questions.platformsSubtitle"),
      step: 1,
      color: "from-blue-600 to-blue-700",
      icon: <PlayCircle className="h-5 w-5" />,
      badge: "Popular",
      description: "Tell us your streaming preferences",
      completionTime: "30 seconds"
    },
    {
      title: t("search.movies"),
      subtitle: t("search.placeholder"),
      step: 2,
      color: "from-purple-600 to-purple-700",
      icon: <Search className="h-5 w-5" />,
      badge: "Fast",
      description: "Find movies instantly with smart search",
      completionTime: "Real-time"
    },
    {
      title: t("creator.searchByCreator"),
      subtitle: t("creator.creatorDescription"),
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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div ref={sectionRef} onMouseMove={handleMouseMove}>
      <DynamicMovieBackground 
        className="rounded-xl min-h-[750px] relative overflow-hidden" 
        overlayOpacity={0.88} 
        variant="gradient" 
        rowCount={4} 
        speed="slow"
      >
        {/* Enhanced floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-2xl"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 rounded-full blur-lg"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />
        </div>

        {/* Parallax container */}
        <motion.div 
          className="relative z-20 py-16 px-6 md:px-8 lg:px-12 flex flex-col items-center max-w-6xl mx-auto"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
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

          {/* Hero Icon with enhanced animation */}
          <motion.div
            variants={itemVariants}
            className="relative mb-8"
          >
            <motion.div
              className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-full p-6 shadow-2xl relative"
              whileHover={{ 
                scale: 1.1,
                rotate: [0, 5, -5, 0],
                boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.6)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Film className="h-12 w-12 text-white relative z-10" />
              
              {/* Rotating border */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-600 opacity-50"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ padding: "2px" }}
              />
            </motion.div>
            
            {/* Enhanced sparkle effects */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute ${i === 0 ? '-top-2 -right-2' : i === 1 ? '-bottom-2 -left-2' : 'top-0 left-0'}`}
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3 + i,
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 0.5
                }}
              >
                <Sparkles className={`h-${4 + i} w-${4 + i} text-yellow-400`} />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Enhanced Title with dynamic gradient */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <motion.span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-400 leading-tight"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              >
                {showPersonalizedContent ? "Welcome Back!" : t("site.findYourMovie")}
              </motion.span>
            </h1>
            
            {/* Dynamic badges */}
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
                : t("site.exploreCollections")
              }
            </p>
            <p className="text-base text-gray-400 max-w-2xl">
              Join over 15,000+ movie lovers finding their perfect match with our AI-powered recommendation engine
            </p>
          </motion.div>

          {/* User Stats for returning users */}
          {showPersonalizedContent && userStats.moviesWatched > 0 && (
            <motion.div
              variants={itemVariants}
              className="mb-8 w-full max-w-4xl"
            >
              <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">Your MovieFinder Journey</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{userStats.moviesWatched}</div>
                      <div className="text-sm text-gray-400">Movies Discovered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{userStats.quizzesCompleted}</div>
                      <div className="text-sm text-gray-400">Quizzes Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-2xl font-bold text-yellow-400">{userStats.avgRating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-400">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{userStats.favoriteGenres.length}</div>
                      <div className="text-sm text-gray-400">Favorite Genres</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Enhanced Steps Card */}
          <motion.div variants={itemVariants} className="w-full max-w-5xl mb-8">
            <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800/50 shadow-2xl">
              <CardContent className="p-8">
                <div className="grid gap-6">
                  {steps.map((step, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start group cursor-pointer relative"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: currentStep === index ? 1.02 : 1,
                      }}
                      transition={{ 
                        delay: 0.3 + (index * 0.1),
                        scale: { duration: 0.3 }
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      onClick={() => setCurrentStep(index)}
                      onMouseEnter={() => setHoveredStep(index)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      <div className={cn(
                        "bg-gradient-to-r rounded-xl h-16 w-16 flex items-center justify-center flex-shrink-0 mr-6 transition-all duration-300 relative",
                        step.color,
                        hoveredStep === index && "shadow-lg scale-110"
                      )}>
                        <span className="text-xl font-bold text-white z-10">{step.step}</span>
                        {currentStep === index && (
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-white/20"
                            layoutId="stepHighlight"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors">
                            {step.title}
                          </h3>
                          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                            {step.badge}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.completionTime}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-2">
                          {step.subtitle}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {step.description}
                        </p>
                      </div>

                      {/* Progress indicator */}
                      <div className="flex-shrink-0 ml-4">
                        <Progress 
                          value={currentStep >= index ? 100 : 0} 
                          className="w-20 h-2"
                        />
                      </div>

                      {/* Active indicator */}
                      {currentStep === index && (
                        <motion.div
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          layoutId="stepIndicator"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <ArrowRight className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Enhanced CTA Section */}
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
                {/* Button background animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <Film className="mr-3 h-6 w-6 relative z-10" />
                <span className="whitespace-nowrap relative z-10">
                  {isLoading ? "Starting..." : showPersonalizedContent ? "Take New Quiz" : t("quiz.start")}
                </span>
                {!isLoading && <Sparkles className="ml-2 h-4 w-4 relative z-10" />}
              </Button>
            </motion.div>
            
            {/* Additional info and features */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
              <motion.p 
                className="text-sm text-gray-400 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <Zap className="h-4 w-4 text-yellow-400" />
                Takes less than 2 minutes
              </motion.p>
              
              <Separator orientation="vertical" className="hidden sm:block h-4" />
              
              <motion.p 
                className="text-sm text-gray-400 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <Users className="h-4 w-4 text-blue-400" />
                Join 15K+ movie lovers
              </motion.p>
            </div>

            {/* Feature highlights */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-8"
              variants={containerVariants}
            >
              {[
                { icon: <TrendingUp className="h-5 w-5" />, text: "99% Match Accuracy", color: "text-green-400" },
                { icon: <Zap className="h-5 w-5" />, text: "Instant Results", color: "text-yellow-400" },
                { icon: <Star className="h-5 w-5" />, text: "Personalized for You", color: "text-purple-400" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center justify-center gap-2 text-sm text-gray-300 bg-gray-900/50 rounded-lg p-3 backdrop-blur-sm border border-gray-800/50"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(17, 24, 39, 0.8)" }}
                >
                  <span className={feature.color}>{feature.icon}</span>
                  {feature.text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </DynamicMovieBackground>
    </div>
  );
};
