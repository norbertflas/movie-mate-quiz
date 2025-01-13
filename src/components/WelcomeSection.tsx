import { Button } from "./ui/button";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-8 py-12">
      <motion.div
        className="space-y-6 max-w-2xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("quiz.welcome")}
        </h1>
        
        <p className="text-lg text-muted-foreground">
          {t("quiz.description")}
        </p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <Button 
            size="lg" 
            onClick={onStartQuiz}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <PlayCircle className="h-5 w-5" />
            {t("quiz.start")}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};