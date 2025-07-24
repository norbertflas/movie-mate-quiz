
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Play, RefreshCw, ExternalLink, Home, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MovieModal, useMovieModal } from "../movie/MovieModal";
import type { MovieRecommendation, QuizPreferences } from "./types/comprehensiveQuizTypes";

interface ComprehensiveQuizResultsProps {
  recommendations: MovieRecommendation[];
  preferences: QuizPreferences;
  onRetakeQuiz: () => void;
}

export const ComprehensiveQuizResults = ({ 
  recommendations, 
  preferences, 
  onRetakeQuiz 
}: ComprehensiveQuizResultsProps) => {
  const navigate = useNavigate();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleMovieClick = (movie: MovieRecommendation) => {
    // Convert recommendation to TMDBMovie format
    const tmdbMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster.replace('https://image.tmdb.org/t/p/w500', ''),
      backdrop_path: movie.poster.replace('https://image.tmdb.org/t/p/w500', '').replace('w500', 'w1280'),
      overview: movie.overview,
      release_date: `${movie.year}-01-01`,
      vote_average: movie.rating,
      genre_ids: [],
      popularity: 0,
      vote_count: 0,
      adult: false,
      original_language: 'en',
      original_title: movie.title,
      video: false,
      explanations: []
    };
    openModal(tmdbMovie);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Your Personalized Recommendations
        </h1>
        <p className="text-gray-400 text-lg">
          Based on your preferences, we found {recommendations.length} perfect movies for you
        </p>
        
        {/* Preferences Summary */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {preferences.genres.length > 0 && (
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
              {preferences.genres.join(', ')}
            </Badge>
          )}
          {preferences.platforms.length > 0 && !preferences.platforms.includes("I don't have a preference") && (
            <Badge variant="secondary" className="bg-green-600/20 text-green-300">
              {preferences.platforms.length} platforms selected
            </Badge>
          )}
          {preferences.era && preferences.era !== "No preference" && (
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
              {preferences.era}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Results Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {recommendations.map((movie, index) => (
          <motion.div
            key={movie.id}
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            className="h-full"
          >
            <Card className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 h-full flex flex-col overflow-hidden">
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-yellow-600 text-white flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {movie.rating.toFixed(1)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Movie Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-2 mb-1">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{movie.year}</span>
                      {movie.genres.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{movie.genres.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-3">
                    {truncateText(movie.overview)}
                  </p>

                  {/* Genre Tags */}
                  {movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 3).map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-300"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <Button
                  onClick={() => handleMovieClick(movie)}
                  className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>

                {/* Streaming Availability */}
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Available on:
                  </h4>
                  
                  <div className="space-y-2">
                    {movie.streaming.slice(0, 3).map((service, serviceIndex) => (
                      <div
                        key={serviceIndex}
                        className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {service.logo && (
                            <img
                              src={service.logo}
                              alt={service.service}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-sm font-medium">{service.service}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={service.type === 'subscription' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {service.type === 'subscription' ? 'Included' : 
                             service.type === 'rent' ? 'Rent' : 'Buy'}
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(service.link, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {movie.streaming.length > 3 && (
                      <p className="text-xs text-gray-400 text-center">
                        +{movie.streaming.length - 3} more services
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex justify-center space-x-4"
      >
        <Button
          onClick={() => navigate('/')}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Button>

        <Button
          onClick={onRetakeQuiz}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retake Quiz
        </Button>
        
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Back to Top
        </Button>
      </motion.div>

      {/* Movie Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};
