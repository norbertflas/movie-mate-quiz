import { useState } from "react";
import { PageContainer } from "@/components/home/PageContainer";
import { QuizContent } from "@/components/home/QuizContent";
import { WelcomeSection } from "@/components/WelcomeSection";
import { MainContent } from "@/components/sections/MainContent";
import { PersonalizedRecommendations } from "@/components/sections/PersonalizedRecommendations";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <AnimatePresence mode="wait">
          {!showQuiz ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WelcomeSection onStartQuiz={handleStartQuiz} />
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuizContent />
            </motion.div>
          )}
        </AnimatePresence>

        {!showQuiz && (
          <AnimatePresence mode="wait">
            <MainContent />
            <PersonalizedRecommendations />
          </AnimatePresence>
        )}
      </motion.div>
    </PageContainer>
  );
};

export default Index;