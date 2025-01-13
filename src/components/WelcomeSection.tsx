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
    <div className="text-center space-y-6 py-8">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t("quiz.welcome")}
      </motion.h1>
      
      <motion.p 
        className="text-lg text-muted-foreground max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {t("quiz.description")}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Button 
          size="lg" 
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={onStartQuiz}
        >
          <PlayCircle className="h-5 w-5" />
          {t("quiz.start")}
        </Button>
      </motion.div>
    </div>
  );
};