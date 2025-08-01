
import { useState } from "react";
import { motion } from "framer-motion";
import { EnhancedMovieModal } from "../movie/EnhancedMovieModal";
import type { TMDBMovie } from "@/services/tmdb";
import { Check, Plus, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";

interface QuizResultsProps {
  recommendations: any[];
  isGroupQuiz?: boolean;
}

export const QuizResults = ({ recommendations, isGroupQuiz = false }: QuizResultsProps) => {
  const { t } = useTranslation();
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMovieClick = (movie: any) => {
    console.log('Opening movie modal for:', movie.title);
    // Convert the movie data to TMDBMovie format
    const tmdbMovie: TMDBMovie = {
      id: movie.id || movie.tmdbId,
      title: movie.title,
      overview: movie.overview || movie.description,
      poster_path: movie.poster_path,
      release_date: movie.release_date || movie.year,
      vote_average: movie.vote_average || movie.rating,
      genre_ids: movie.genre_ids || [],
      popularity: movie.popularity || 0,
      backdrop_path: movie.backdrop_path,
      vote_count: movie.vote_count || 0,
      explanations: movie.explanations || []
    };
    
    setSelectedMovie(tmdbMovie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  // Ensure we display exactly 5 recommendations as requested
  const displayRecommendations = recommendations.slice(0, 5);
  
  return (
    <div className="w-full bg-black text-white rounded-xl overflow-hidden">
      <div className="p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500 mb-4 sm:mb-6">
            <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            {t("quiz.recommendations.title")}
          </h1>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-2">
            {t("quiz.recommendations.subtitle")}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {displayRecommendations.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer"
                   onClick={() => handleMovieClick(movie)}>
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/placeholder.svg'
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs font-medium">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm sm:text-lg font-bold leading-tight line-clamp-2 flex-1">{movie.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 mb-3">
                    {movie.overview || movie.description}
                  </p>

                  {/* Explanations */}
                  {movie.explanations && movie.explanations.length > 0 && (
                    <div className="mb-3">
                      {movie.explanations.slice(0, 2).map((explanation: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs mr-1 mb-1 bg-blue-900/30 text-blue-300">
                          {explanation}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Streaming availability */}
                  {movie.availableOn && movie.availableOn.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-300 mb-2">{t("common.availableOn")}:</p>
                      <div className="flex flex-wrap gap-1">
                        {movie.availableOn.slice(0, 3).map((platform: string) => (
                          <Badge key={platform} className="text-xs bg-green-900/30 text-green-300">
                            {platform}
                          </Badge>
                        ))}
                        {movie.availableOn.length > 3 && (
                          <Badge className="text-xs bg-gray-700 text-gray-300">
                            +{movie.availableOn.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(movie);
                    }}
                  >
                    <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {t("common.viewDetails")}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-gray-400 mb-4 text-sm sm:text-base px-2">{t("quiz.recommendations.explore")}</p>
          <Button variant="outline" className="bg-gray-900 border-gray-700 hover:bg-gray-800">
            {t("quiz.recommendations.tryAgain")}
          </Button>
        </div>
      </div>

      {/* Enhanced Movie Modal */}
      {selectedMovie && (
        <EnhancedMovieModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          movie={selectedMovie}
          explanations={selectedMovie.explanations || []}
        />
      )}
    </div>
  );
};
