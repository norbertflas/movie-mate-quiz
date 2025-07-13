
import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizContent } from '@/components/home/QuizContent';
import { WelcomeSection } from '@/components/WelcomeSection';
import { MainContent } from '@/components/sections/MainContent';
import { QuickActions } from '@/components/QuickActions';
import { LoadingState } from '@/components/LoadingState';

const LazyPersonalizedRecommendations = lazy(() => 
  import("@/components/sections/PersonalizedRecommendations").then(module => ({
    default: module.PersonalizedRecommendations
  }))
);

const LazyAdvancedFilters = lazy(() =>
  import("@/components/filters/AdvancedFilters")
);

const LazyWatchlist = lazy(() =>
  import("@/components/watchlist/Watchlist")
);

interface IndexMainContentProps {
  state: {
    showQuiz: boolean;
    isTransitioning: boolean;
    showAdvancedFilters: boolean;
    showWatchlist: boolean;
    currentView: 'welcome' | 'quiz' | 'explore';
  };
  userPreferences: any;
  trendingMovies: any[];
  popularMovies: any[];
  isLoading: boolean;
  hasError: boolean;
  onStartQuiz: () => void;
  onBackToWelcome: () => void;
  onQuizComplete: (results: any) => void;
  onToggleFilters: () => void;
  onToggleWatchlist: () => void;
  onRetry: () => void;
  setUserPreferences: (preferences: any) => void;
  isMobile: boolean;
}

export const IndexMainContent = ({
  state,
  userPreferences,
  trendingMovies,
  popularMovies,
  isLoading,
  hasError,
  onStartQuiz,
  onBackToWelcome,
  onQuizComplete,
  onToggleFilters,
  onToggleWatchlist,
  onRetry,
  setUserPreferences,
  isMobile
}: IndexMainContentProps) => {
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

  return (
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
            <QuizContent 
              onBack={onBackToWelcome}
              onComplete={onQuizComplete}
              userPreferences={userPreferences}
            />
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
              onStartQuiz={onStartQuiz}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content below welcome/quiz */}
      <AnimatePresence>
        {!state.showQuiz && (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4 sm:space-y-8"
          >
            <motion.div variants={contentVariants}>
              <QuickActions 
                onToggleFilters={onToggleFilters}
                onToggleWatchlist={onToggleWatchlist}
                showAdvancedFilters={state.showAdvancedFilters}
                showWatchlist={state.showWatchlist}
                userPreferences={userPreferences}
              />
            </motion.div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {state.showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<LoadingState />}>
                    <LazyAdvancedFilters 
                      userPreferences={userPreferences}
                      onPreferencesUpdate={setUserPreferences}
                    />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Watchlist Panel */}
            <AnimatePresence>
              {state.showWatchlist && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<LoadingState />}>
                    <LazyWatchlist 
                      userPreferences={userPreferences}
                      onUpdate={setUserPreferences}
                    />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div variants={contentVariants}>
              <MainContent 
                trendingMovies={trendingMovies}
                popularMovies={popularMovies}
                isLoading={isLoading}
                hasError={hasError}
                onRetry={onRetry}
                userPreferences={userPreferences}
                currentView={state.currentView}
              />
            </motion.div>
            
            <motion.div variants={contentVariants}>
              <Suspense fallback={
                <div className="h-64 flex items-center justify-center">
                  <LoadingState message="Loading personalized recommendations..." />
                </div>
              }>
                <LazyPersonalizedRecommendations 
                  userPreferences={userPreferences}
                  trendingMovies={trendingMovies}
                  popularMovies={popularMovies}
                />
              </Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
