
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import EnhancedQuiz from "@/components/quiz/EnhancedQuiz";

interface QuizContentProps {
  onBack?: () => void;
  onComplete?: (results: any) => void;
  userPreferences?: any;
}

export const QuizContent = ({ onBack, onComplete, userPreferences }: QuizContentProps) => {
  const handleQuizComplete = (results: any) => {
    console.log('QuizContent: Quiz completed with results:', results);
    // Don't call onComplete to prevent redirect
    // if (onComplete) {
    //   onComplete(results);
    // }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <EnhancedQuiz 
        onBack={onBack}
        onComplete={handleQuizComplete}
        userPreferences={userPreferences}
      />
    </motion.div>
  );
};
