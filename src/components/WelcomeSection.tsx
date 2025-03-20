
import { Button } from "./ui/button";
import { PlayCircle, Film, Tv } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-xl bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-indigo-800/10 to-purple-900/10" />
      
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Play icon circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-purple-600 rounded-full p-6 mb-8"
        >
          <PlayCircle className="h-10 w-10 text-white" />
        </motion.div>
        
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4"
        >
          Find Your Perfect Movie Match
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg sm:text-xl text-gray-300 text-center max-w-3xl mb-16"
        >
          Take our quick and fun quiz to discover movies and shows tailored just for you
        </motion.p>
        
        {/* Quiz steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-900/80 rounded-xl p-8 max-w-3xl w-full mb-8"
        >
          {/* Step 1 */}
          <div className="flex mb-8">
            <div className="bg-blue-800 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-5">
              <span className="text-xl font-bold">1</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Select your streaming services</h3>
              <p className="text-gray-400">Tell us which platforms you subscribe to</p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex mb-8">
            <div className="bg-purple-800 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-5">
              <span className="text-xl font-bold">2</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Tell us what you like</h3>
              <p className="text-gray-400">Movies or shows, genres, length, and mood</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex">
            <div className="bg-pink-800 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-5">
              <span className="text-xl font-bold">3</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Get personalized recommendations</h3>
              <p className="text-gray-400">Discover content perfectly matched to your taste</p>
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
            className="px-8 py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Start the Quiz
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
