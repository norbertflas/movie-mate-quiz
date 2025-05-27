
import { useState } from "react";
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

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const { isLoading: isTrendingLoading, data: trendingMovies = [] } = useQuery({
    queryKey: ['trendingMovies', 'US', '1'],
    queryFn: getTrendingMovies,
  });

  const { isLoading: isPopularLoading, data: popularMovies = [] } = useQuery({
    queryKey: ['popularMovies', 'US', '1'],
    queryFn: getPopularMovies,
  });

  const handleStartQuiz = () => {
    setIsLoading(true);
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      setShowQuiz(true);
    }, 1000);
  };

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`space-y-4 sm:space-y-8 min-h-screen pb-4 sm:pb-8 ${isMobile ? 'px-1' : ''}`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-8"
            >
              <LoadingState />
            </motion.div>
          ) : showQuiz ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="w-full"
            >
              <QuizContent />
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <WelcomeSection onStartQuiz={handleStartQuiz} />
            </motion.div>
          )}
        </AnimatePresence>

        {!showQuiz && !isLoading && (
          <>
            <QuickActions />
            <MainContent />
            <PersonalizedRecommendations />
          </>
        )}
      </motion.div>
    </PageContainer>
  );
};

export default Index;
