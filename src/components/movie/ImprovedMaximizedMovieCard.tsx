import { useState, memo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, Minimize2, Play, Star, Share2, Bookmark, 
  Clock, Calendar, Users, Award, Download, Eye, EyeOff,
  Copy, ExternalLink, TrendingUp, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedMovieImage } from "./OptimizedMovieImage";
import { MovieRating } from "./MovieRating";
import { MovieStreamingServices } from "./MovieStreamingServices";
import type { MovieCardProps } from "@/types/movie";

export const ImprovedMaximizedMovieCard = memo(({
  title = "Unknown Movie",
  year = "N/A",
  platform = "Unknown",
  genre = "",
  imageUrl = '/placeholder.svg',
  description = "",
  trailerUrl = "",
  rating = 0,
  tags = [],
  streamingServices = [],
  tmdbId,
  explanations = [],
  onMinimize,
  onClose,
  director = "Unknown Director",
  runtime = 120,
  releaseDate,
  cast = [],
  budget = "Unknown",
  popularity = 0
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [personalRating, setPersonalRating] = useState(0);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  }, []);

  const handleToggleWatchlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWatchlisted(prev => !prev);
  }, []);

  const handleToggleWatched = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWatched(prev => !prev);
  }, []);

  const handlePlayTrailer = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (trailerUrl) {
      setShowTrailer(true);
    }
  }, [trailerUrl]);

  const handleShare = useCallback(async (platform = 'native') => {
    const shareData = {
      title: title,
      text: `Check out "${title}" - ${description?.slice(0, 100)}...`,
      url: window.location.href
    };

    try {
      switch(platform) {
        case 'copy':
          await navigator.clipboard.writeText(shareData.url);
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share(shareData);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.log('Sharing failed or cancelled');
    }
    setShowShareMenu(false);
  }, [title, description]);

  const formatRuntime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return year;
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, [year]);

  // Convert streamingServices to the format expected by MovieStreamingServices
  const formatStreamingServices = useCallback(() => {
    if (!streamingServices || streamingServices.length === 0) return [];
    
    return streamingServices.map(service => {
      if (typeof service === 'string') {
        return service;
      }
      return service.service;
    });
  }, [streamingServices]);

  // Early return if no title (invalid props)
  if (!title) {
    console.warn('ImprovedMaximizedMovieCard: title is required');
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gray-900 border-gray-700">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </motion.div>
              <span className="font-semibold text-sm text-white">Featured Movie</span>
              <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                HOT
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {onMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMinimize();
                  }}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <div className="relative">
            {/* Movie Image Section */}
            <div className="relative h-80 overflow-hidden group">
              <OptimizedMovieImage
                imageUrl={imageUrl}
                title={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="eager"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60">
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="w-full h-full animate-pulse" 
                    style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                                       radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)`,
                      backgroundSize: '100px 100px'
                    }}
                  />
                </div>
              </div>
              
              {/* Top controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white border-gray-600"
                    onClick={handleToggleFavorite}
                  >
                    <Heart 
                      className={`h-4 w-4 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                    />
                  </Button>
                </motion.div>
                
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white border-gray-600"
                    onClick={() => setShowShareMenu(prev => !prev)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-600 p-2 z-10 min-w-32"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare('copy')}
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Copy className="h-3 w-3 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare('native')}
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Share
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg" title={title}>
                    {title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-sm text-white/90 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {year}
                    </div>
                    {genre && (
                      <>
                        <span>•</span>
                        <span>{genre.split(',')[0]}</span>
                      </>
                    )}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatRuntime(runtime)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <MovieRating rating={rating} />
                    {platform && (
                      <Badge variant="secondary" className="text-xs bg-blue-600/30 text-blue-300 border-blue-600/50">
                        {platform}
                      </Badge>
                    )}
                    <div className="flex items-center text-sm text-white/80">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {popularity}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {trailerUrl && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 shadow-lg"
                          onClick={handlePlayTrailer}
                        >
                          <Play className="h-4 w-4 mr-1 fill-white" />
                          Trailer
                        </Button>
                      </motion.div>
                    )}
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      className={`backdrop-blur-sm border-white/30 ${
                        isWatchlisted 
                          ? 'bg-blue-600/30 text-blue-300' 
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                      onClick={handleToggleWatchlist}
                    >
                      <Bookmark className={`h-4 w-4 mr-1 ${isWatchlisted ? 'fill-current' : ''}`} />
                      {isWatchlisted ? 'Listed' : 'List'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <CardContent className="p-4 space-y-4 bg-gray-800">
            {/* Description */}
            {description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                  {description}
                </p>
              </motion.div>
            )}

            {/* Movie details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-2 gap-2 text-xs text-gray-400"
            >
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Director: {director}
              </div>
              <div className="flex items-center">
                <Award className="h-3 w-3 mr-1" />
                Budget: {budget}
              </div>
            </motion.div>

            {/* Personal Rating */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <span className="text-gray-300 text-sm">Your rating:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ratingValue) => (
                  <button
                    key={ratingValue}
                    onClick={() => setPersonalRating(ratingValue)}
                    className={`w-6 h-6 rounded text-xs font-semibold transition-colors ${
                      ratingValue <= personalRating
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {ratingValue}
                  </button>
                ))}
              </div>
              {personalRating > 0 && (
                <span className="text-yellow-400 text-sm">{personalRating}/10</span>
              )}
            </motion.div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 4 && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      +{tags.length - 4} more
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}

            {/* Streaming Services section */}
            {streamingServices && streamingServices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-2"
              >
                <h4 className="text-sm font-medium text-white">Available on:</h4>
                <MovieStreamingServices services={formatStreamingServices()} />
              </motion.div>
            )}

            {/* Explanations */}
            {explanations && explanations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-2"
              >
                <h4 className="text-sm font-medium text-white">Why this recommendation:</h4>
                <div className="space-y-1">
                  {explanations.slice(0, 2).map((explanation, index) => (
                    <p key={index} className="text-xs text-gray-400 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {explanation}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex gap-2 pt-2 border-t border-gray-700"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleWatched}
                className={`flex-1 text-xs ${
                  isWatched 
                    ? 'bg-green-600/20 text-green-400 border-green-600/50' 
                    : 'text-gray-400 border-gray-600 hover:bg-gray-700'
                }`}
              >
                {isWatched ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                {isWatched ? 'Watched' : 'Mark Watched'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs text-gray-400 border-gray-600 hover:bg-gray-700"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailerUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-4xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold mb-2">{title} - Trailer</h3>
                    <p className="text-gray-400">Trailer playback would be implemented here</p>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute -top-12 right-0 bg-gray-800 hover:bg-gray-700"
                onClick={() => setShowTrailer(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

ImprovedMaximizedMovieCard.displayName = "ImprovedMaximizedMovieCard";
