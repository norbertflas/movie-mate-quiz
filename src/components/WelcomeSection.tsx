
import { Button } from "./ui/button";
import { PlayCircle, Sparkles, Star, Film, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const { t } = useTranslation();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 opacity-90" />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative text-center space-y-8 py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div variants={item} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Discover Your Perfect Movie Match
            </h1>
            <p className="text-xl sm:text-2xl text-white/80">
              Take our interactive quiz and find films tailored to your taste
            </p>
          </motion.div>

          <motion.div variants={item} className="pt-8">
            <Button 
              size="lg" 
              onClick={onStartQuiz}
              className="group relative px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700"
            >
              <span className="flex items-center gap-3">
                <PlayCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Start Quiz</span>
                <Sparkles className="h-5 w-5 animate-pulse" />
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),transparent)] opacity-20" />
    </div>
  );
};
