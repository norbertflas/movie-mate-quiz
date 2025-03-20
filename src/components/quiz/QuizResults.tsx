
import { useState } from "react";
import { MovieCard } from "../MovieCard";
import { motion } from "framer-motion";
import { UnifiedMovieDetails } from "../movie/UnifiedMovieDetails";
import type { TMDBMovie } from "@/services/tmdb";
import { Check, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface QuizResultsProps {
  recommendations: any[];
  isGroupQuiz?: boolean;
}

export const QuizResults = ({ recommendations, isGroupQuiz = false }: QuizResultsProps) => {
  const { t } = useTranslation();
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div className="w-full bg-black text-white rounded-xl overflow-hidden">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-6">
            <Check className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            {t("quiz.recommendations.title")}
          </h1>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("quiz.recommendations.subtitle")}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.slice(0, 6).map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => handleMovieClick(movie)}
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{movie.title}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {movie.overview}
                  </p>
                  
                  <Button
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Watchlist
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">{t("quiz.recommendations.explore")}</p>
          <Button variant="outline" className="bg-gray-900 border-gray-700 hover:bg-gray-800">
            {t("quiz.recommendations.tryAgain")}
          </Button>
        </div>
      </div>

      <UnifiedMovieDetails
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        movie={selectedMovie}
        explanations={selectedMovie?.explanations}
      />
    </div>
  );
};
