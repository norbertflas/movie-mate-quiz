
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PlayCircle, Film, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DynamicMovieBackground } from "./movie/DynamicMovieBackground";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-rotate featured steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: t("quiz.questions.platforms"),
      subtitle: t("quiz.questions.platformsSubtitle"),
      step: 1,
      color: "bg-primary/80",
      icon: <PlayCircle className="h-5 w-5" />
    },
    {
      title: t("search.movies"),
      subtitle: t("search.placeholder"),
      step: 2,
      color: "bg-purple-700/80",
      icon: <Search className="h-5 w-5" />
    },
    {
      title: t("creator.searchByCreator"),
      subtitle: t("creator.creatorDescription"),
      step: 3,
      color: "bg-pink-700/80",
      icon: <User className="h-5 w-5" />
    }
  ];

  const handleCreatorSearch = () => {
    navigate("/search?type=creators");
  };

  return (
    <DynamicMovieBackground 
      className="rounded-xl min-h-[600px]" 
      overlayOpacity={0.85} 
      variant="gradient" 
      rowCount={4} 
      speed="slow"
    >
      {/* Content */}
      <div className="relative z-20 py-16 px-6 md:px-8 lg:px-12 flex flex-col items-center max-w-4xl mx-auto">
        {/* Animated play icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-primary/90 rounded-full p-6 mb-8"
        >
          <PlayCircle className="h-12 w-12 text-white" />
        </motion.div>
        
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-400 mb-4 whitespace-normal"
        >
          {t("site.findYourMovie")}
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl mb-16 whitespace-normal"
        >
          {t("site.exploreCollections")}
        </motion.p>
        
        {/* Quiz steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-900/80 backdrop-blur-md rounded-xl p-8 max-w-3xl w-full mb-8 border border-gray-800"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="flex items-start mb-8 last:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: currentStep === index ? 1.03 : 1,
                boxShadow: currentStep === index ? "0 0 15px rgba(124, 58, 237, 0.3)" : "none"
              }}
              transition={{ 
                delay: 0.5 + (index * 0.2), 
                duration: 0.5,
                scale: { duration: 0.3 }
              }}
            >
              <div className={`${step.color} rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-5`}>
                <span className="text-xl font-bold">{step.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white whitespace-normal">{step.title}</h3>
                <p className="text-gray-400 whitespace-normal">{step.subtitle}</p>
              </div>
              {index === 2 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreatorSearch}
                    className="whitespace-nowrap"
                  >
                    {step.icon}
                    <span className="ml-2">Try it</span>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {/* Start Quiz Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            size="lg" 
            onClick={onStartQuiz}
            className="px-8 py-6 text-lg font-medium bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:translate-y-[-2px]"
          >
            <Film className="mr-2 h-5 w-5" />
            <span className="whitespace-nowrap">{t("quiz.start")}</span>
          </Button>
        </motion.div>
      </div>
    </DynamicMovieBackground>
  );
};
