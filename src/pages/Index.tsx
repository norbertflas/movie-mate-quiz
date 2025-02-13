
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
        className="space-y-8 min-h-screen pb-8"
      >
        <AnimatePresence mode="sync">
          {!showQuiz ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <WelcomeSection onStartQuiz={handleStartQuiz} />
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <QuizContent />
            </motion.div>
          )}
        </AnimatePresence>

        {!showQuiz && (
          <>
            <MainContent />
            <PersonalizedRecommendations />
          </>
        )}
      </motion.div>
    </PageContainer>
  );
};

export default Index;
