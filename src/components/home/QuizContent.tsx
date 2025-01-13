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
      <Card className="p-6">
        <QuizSection />
      </Card>
    </motion.div>
  );
};