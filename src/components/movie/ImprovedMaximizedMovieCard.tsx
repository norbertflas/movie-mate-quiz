
import { useState, memo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, Minimize2, Play, Star, Share2, Bookmark, 
  Clock, Calendar, Users, Award, Download, Eye, EyeOff,
  Copy, ExternalLink, TrendingUp, X, Search, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MovieRating } from "./MovieRating";
import { MovieStreamingServices } from "./MovieStreamingServices";
import { useOptimizedStreaming } from "@/hooks/use-optimized-streaming";
import { useToast } from "@/hooks/use-toast";
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
  const [isSearchingStreaming, setIsSearchingStreaming] = useState(false);
  
  const { toast } = useToast();
  
  // Use optimized streaming hook
  const streamingData = useOptimizedStreaming(tmdbId && tmdbId > 0 ? tmdbId : 0, title, year);

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

  const handleSearchStreaming = useCallback(async () => {
    if (!tmdbId || tmdbId <= 0) {
      toast({
        title: "Błąd",
        description: "Nie można wyszukać dostępności dla tego filmu",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingStreaming(true);
    try {
      await streamingData.fetchData();
      toast({
        title: "Wyszukiwanie zakończone",
        description: `Znaleziono ${streamingData.services.length} serwisów streamingowych`,
      });
    } catch (error) {
      toast({
        title: "Błąd wyszukiwania",
        description: "Nie udało się wyszukać dostępności streamingowej",
        variant: "destructive",
      });
    } finally {
      setIsSearchingStreaming(false);
    }
  }, [tmdbId, streamingData, toast]);

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
          toast({
            title: "Skopiowano",
            description: "Link został skopiowany do schowka",
          });
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
  }, [title, description, toast]);

  const formatRuntime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  const formatStreamingServices = useCallback(() => {
    const services = streamingData.services?.length > 0 ? streamingData.services : streamingServices;
    
    if (!services || services.length === 0) return [];
    
    return services.map(service => {
      if (typeof service === 'string') {
        return service;
      }
      return service.service;
    });
  }, [streamingServices, streamingData.services]);

  // Fix image URL
  const posterUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : imageUrl?.startsWith('/') 
      ? `https://image.tmdb.org/t/p/w1280${imageUrl}`
      : imageUrl || '/placeholder.svg';

  if (!title) {
    console.warn('ImprovedMaximizedMovieCard: title is required');
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <Card className="w-full h-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl bg-gray-900 border-gray-700 flex flex-col">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              </motion.div>
              <span className="font-semibold text-white text-lg">Featured Movie</span>
              <Badge variant="secondary" className="text-sm bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                HOT
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {onMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMinimize();
                  }}
                >
                  <Minimize2 className="h-5 w-5" />
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardHeader>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left side - Image */}
            <div className="w-1/2 relative overflow-hidden">
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60" />
              
              {/* Top controls on image */}
              <div className="absolute top-6 right-6 flex space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white border-gray-600"
                  onClick={handleToggleFavorite}
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                  />
                </Button>
                
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white border-gray-600"
                    onClick={() => setShowShareMenu(prev => !prev)}
                  >
                    <Share2 className="h-5 w-5" />
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
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare('native')}
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action buttons on image */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex gap-3 flex-wrap">
                  {trailerUrl && (
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 shadow-lg px-6 py-3"
                      onClick={handlePlayTrailer}
                    >
                      <Play className="h-5 w-5 mr-2 fill-white" />
                      Trailer
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`backdrop-blur-sm border-white/30 px-6 py-3 ${
                      isWatchlisted 
                        ? 'bg-blue-600/30 text-blue-300' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                    onClick={handleToggleWatchlist}
                  >
                    <Bookmark className={`h-5 w-5 mr-2 ${isWatchlisted ? 'fill-current' : ''}`} />
                    {isWatchlisted ? 'Listed' : 'List'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="backdrop-blur-sm border-white/30 bg-purple-600/20 hover:bg-purple-600/30 px-6 py-3"
                    onClick={handleSearchStreaming}
                    disabled={isSearchingStreaming}
                  >
                    {isSearchingStreaming ? (
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5 mr-2" />
                    )}
                    {isSearchingStreaming ? 'Szukam...' : 'Znajdź streaming'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <CardContent className="w-1/2 p-8 space-y-6 bg-gray-800 overflow-y-auto">
              {/* Title and basic info */}
              <div>
                <h3 className="text-4xl font-bold mb-4 text-white" title={title}>
                  {title}
                </h3>
                
                <div className="flex items-center gap-4 text-lg text-white/90 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {year}
                  </div>
                  {genre && (
                    <>
                      <span>•</span>
                      <span>{genre.split(',')[0]}</span>
                    </>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {formatRuntime(runtime)}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <MovieRating rating={rating} />
                  {platform && (
                    <Badge variant="secondary" className="text-sm bg-blue-600/30 text-blue-300 border-blue-600/50 px-3 py-1">
                      {platform}
                    </Badge>
                  )}
                  <div className="flex items-center text-lg text-white/80">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {popularity}
                  </div>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Movie details */}
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Director: {director}
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Budget: {budget}
                </div>
              </div>

              {/* Personal Rating */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-lg">Your rating:</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ratingValue) => (
                    <button
                      key={ratingValue}
                      onClick={() => setPersonalRating(ratingValue)}
                      className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
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
                  <span className="text-yellow-400 text-lg">{personalRating}/10</span>
                )}
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 6).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-sm border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                    {tags.length > 6 && (
                      <Badge variant="outline" className="text-sm border-gray-600 text-gray-300 px-3 py-1">
                        +{tags.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Streaming Services section */}
              {formatStreamingServices().length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-white">Available on:</h4>
                  <MovieStreamingServices services={formatStreamingServices()} />
                </div>
              )}

              {/* Streaming status */}
              {streamingData.isLoading && (
                <div className="text-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-gray-400">Searching for streaming availability...</p>
                </div>
              )}

              {streamingData.error && (
                <div className="text-center py-4">
                  <p className="text-sm text-red-400">Failed to load streaming data</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => streamingData.refetch()}
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Explanations */}
              {explanations && explanations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-white">Why this recommendation:</h4>
                  <div className="space-y-2">
                    {explanations.slice(0, 3).map((explanation, index) => (
                      <p key={index} className="text-sm text-gray-400 flex items-start">
                        <span className="text-blue-400 mr-3">•</span>
                        {explanation}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleWatched}
                  className={`flex-1 text-sm ${
                    isWatched 
                      ? 'bg-green-600/20 text-green-400 border-green-600/50' 
                      : 'text-gray-400 border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isWatched ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  {isWatched ? 'Watched' : 'Mark Watched'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-sm text-gray-400 border-gray-600 hover:bg-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </div>
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
              className="relative w-full max-w-6xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-20 w-20 mx-auto mb-6 text-red-500" />
                    <h3 className="text-2xl font-bold mb-3">{title} - Trailer</h3>
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
                <X className="h-5 w-5 mr-2" />
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
