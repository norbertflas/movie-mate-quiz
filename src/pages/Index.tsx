
import { useState, useCallback, useMemo, useEffect } from "react";
import { PageContainer } from "@/components/home/PageContainer";
import { QuizContent } from "@/components/home/QuizContent";
import { WelcomeSection } from "@/components/WelcomeSection";
import { MainContent } from "@/components/sections/MainContent";
import { PersonalizedRecommendations } from "@/components/sections/PersonalizedRecommendations";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingState } from "@/components/LoadingState";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies, getPopularMovies } from "@/services/tmdb/trending";
import { QuickActions } from "@/components/QuickActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

// Enhanced types
interface IndexState {
  showQuiz: boolean;
  isTransitioning: boolean;
  currentView: 'welcome' | 'quiz' | 'explore';
}

// User preferences type
interface UserPreferences {
  hasCompletedOnboarding: boolean;
  preferredGenres: string[];
  viewingHistory: any[];
  favoriteActors: string[];
  streamingServices: string[];
  lastVisit: string | null;
  theme: string;
}

const Index = () => {
  const isMobile = useIsMobile();
  
  // Enhanced state management
  const [state, setState] = useState<IndexState>({
    showQuiz: false,
    isTransitioning: false,
    currentView: 'welcome'
  });

  // Simple user preferences (without localStorage hook for now)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    hasCompletedOnboarding: false,
    preferredGenres: [],
    viewingHistory: [],
    favoriteActors: [],
    streamingServices: [],
    lastVisit: null,
    theme: 'dark'
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('moviefinder_preferences');
    if (stored) {
      try {
        setUserPreferences(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('moviefinder_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Enhanced queries with better error handling and caching
  const { 
    isLoading: isTrendingLoading, 
    data: trendingMovies = [], 
    error: trendingError,
    refetch: refetchTrending
  } = useQuery({
    queryKey: ['trendingMovies', 'US', '1'],
    queryFn: getTrendingMovies,
    retry: 3,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  const { 
    isLoading: isPopularLoading, 
    data: popularMovies = [], 
    error: popularError,
    refetch: refetchPopular
  } = useQuery({
    queryKey: ['popularMovies', 'US', '1'],
    queryFn: getPopularMovies,
    retry: 3,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Show error toasts when API calls fail
  useEffect(() => {
    if (trendingError) {
      toast({
        variant: "destructive",
        title: "Failed to load trending movies",
        description: "Please try again later.",
      });
    }
  }, [trendingError, toast]);

  useEffect(() => {
    if (popularError) {
      toast({
        variant: "destructive",
        title: "Failed to load popular movies", 
        description: "Please try again later.",
      });
    }
  }, [popularError, toast]);

  // Optimized handlers with useCallback
  const handleStartQuiz = useCallback(() => {
    console.log('Quiz started from welcome section');
    
    setState(prev => ({ ...prev, isTransitioning: true }));
    
    // Natural transition without artificial delay
    requestAnimationFrame(() => {
      setState(prev => ({ 
        ...prev, 
        showQuiz: true, 
        currentView: 'quiz',
        isTransitioning: false 
      }));
    });
  }, []);

  const handleBackToWelcome = useCallback(() => {
    console.log('Exiting quiz back to welcome');
    
    setState(prev => ({ 
      ...prev, 
      showQuiz: false, 
      currentView: 'welcome' 
    }));
  }, []);

  const handleQuizComplete = useCallback((results: any) => {
    console.log('Quiz completed with results:', results);

    // Update user preferences with quiz results
    setUserPreferences(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      preferredGenres: results.genres || [],
      streamingServices: results.services || []
    }));

    setState(prev => ({ 
      ...prev, 
      showQuiz: false, 
      currentView: 'explore' 
    }));

    toast({
      title: "Quiz completed!",
      description: "Here are your personalized recommendations.",
    });
  }, [toast]);

  // Memoize loading and error states
  const isLoading = useMemo(() => 
    isTrendingLoading || isPopularLoading || state.isTransitioning,
    [isTrendingLoading, isPopularLoading, state.isTransitioning]
  );

  const hasApiError = useMemo(() => 
    !!trendingError || !!popularError,
    [trendingError, popularError]
  );

  // Enhanced animation variants
  const pageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: { 
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      filter: "blur(2px)",
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            // Open search
            window.location.href = '/search';
            break;
          case 'q':
            e.preventDefault();
            if (!state.showQuiz) handleStartQuiz();
            break;
        }
      }
      
      if (e.key === 'Escape') {
        if (state.showQuiz) handleBackToWelcome();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state, handleStartQuiz, handleBackToWelcome]);

  return (
    <PageContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className={`space-y-4 sm:space-y-8 min-h-screen pb-4 sm:pb-8 ${isMobile ? 'px-1' : ''}`}
      >
        {/* Main content area */}
        <AnimatePresence mode="wait" initial={false}>
          {state.showQuiz ? (
            <motion.div
              key="quiz"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <QuizContent />
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <WelcomeSection 
                onStartQuiz={handleStartQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content below welcome/quiz - show only when not in quiz mode */}
        <AnimatePresence>
          {!state.showQuiz && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4 sm:space-y-8"
            >
              {/* Quick Actions with enhanced features */}
              <motion.div variants={contentVariants}>
                <QuickActions />
              </motion.div>
              
              {/* Main Content with enhanced error handling */}
              <motion.div variants={contentVariants}>
                <MainContent />
              </motion.div>
              
              {/* Personalized Recommendations */}
              <motion.div variants={contentVariants}>
                <PersonalizedRecommendations />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageContainer>
  );
};

export default Index;
