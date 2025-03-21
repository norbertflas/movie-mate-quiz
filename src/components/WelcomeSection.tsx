
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PlayCircle, Film } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getPopularMovies } from "@/services/tmdb/trending";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const { t } = useTranslation();
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);

  // Get top-rated movies for the background
  const { data: popularMovies = [] } = useQuery({
    queryKey: ['popularMovies', 'US', '1'],
    queryFn: getPopularMovies,
  });

  // Limit to 6 movies for the background grid
  const backgroundMovies = popularMovies.slice(0, 6);

  useEffect(() => {
    // Fade in the background after component mounts
    const timer = setTimeout(() => {
      setBackgroundOpacity(0.15);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black/90 text-white min-h-[600px]">
      {/* Background movie posters grid */}
      <div 
        className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-1 transition-opacity duration-1000"
        style={{ opacity: backgroundOpacity }}
      >
        {backgroundMovies.map((movie, index) => (
          <div key={index} className="relative overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95 z-10" />
      
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
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-400 mb-4"
        >
          {t("site.findYourMovie")}
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl mb-16"
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
          {/* Step 1 */}
          <div className="flex items-start mb-8">
            <div className="bg-primary/80 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-5">
              <span className="text-xl font-bold">1</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{t("quiz.questions.platforms")}</h3>
              <p className="text-gray-400">{t("quiz.questions.platformsSubtitle")}</p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex items-start mb-8">
            <div className="bg-purple-700/80 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-5">
              <span className="text-xl font-bold">2</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{t("quiz.questions.mood")}</h3>
              <p className="text-gray-400">{t("quiz.questions.moodSubtitle")}</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex items-start">
            <div className="bg-pink-700/80 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-5">
              <span className="text-xl font-bold">3</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{t("recommendations.personalized")}</h3>
              <p className="text-gray-400">{t("recommendations.personalizedDescription")}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Start Quiz Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4"
        >
          <Button 
            size="lg" 
            onClick={onStartQuiz}
            className="px-8 py-6 text-lg font-medium bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:translate-y-[-2px]"
          >
            <Film className="mr-2 h-5 w-5" />
            {t("quiz.start")}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
