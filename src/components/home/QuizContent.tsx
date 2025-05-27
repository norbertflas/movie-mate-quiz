
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import EnhancedQuiz from "@/components/quiz/EnhancedQuiz";

export const QuizContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <EnhancedQuiz />
    </motion.div>
  );
};
