import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { QuizSection } from "@/components/QuizSection";

export const QuizContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-blue-200/20 dark:border-blue-800/20 hover:shadow-2xl transition-all duration-300">
        <QuizSection />
      </Card>
    </motion.div>
  );
};