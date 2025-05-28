
import { useState, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, Play, Heart, Bookmark, TrendingUp,
  Flame, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import type { MovieCardProps } from "@/types/movie";

export const ImprovedMinimizedMovieCard = memo(({
  title = "Unknown Movie",
  year = "N/A",
  imageUrl = '/placeholder.svg',
  rating = 0,
  genre = "",
  tmdbId,
  onExpand,
  onClick,
  priority = false,
  isWatched = false,
  isWatchlisted = false,
  hasTrailer = false,
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (onExpand) {
      onExpand();
    }
  }, [onClick, onExpand]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand();
    }
  }, [onExpand]);

  // Fix image URL - ensure it's a complete URL
  const posterUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : imageUrl?.startsWith('/') 
      ? `https://image.tmdb.org/t/p/w500${imageUrl}`
      : imageUrl || '/placeholder.svg';

  // Convert rating from 0-100 to 0-10 scale
  const displayRating = rating > 10 ? (rating / 10).toFixed(1) : rating.toFixed(1);

  const getRatingColor = (rating: number) => {
    const normalizedRating = rating > 10 ? rating / 10 : rating;
    if (normalizedRating >= 8.0) return 'text-green-400 bg-green-500/20';
    if (normalizedRating >= 7.0) return 'text-yellow-400 bg-yellow-500/20';
    if (normalizedRating >= 6.0) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getTrendingIcon = () => {
    if (priority) return <Flame className="h-3 w-3 text-red-500" />;
    return <TrendingUp className="h-3 w-3 text-orange-500" />;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full max-w-64"
    >
      <Card 
        className="h-96 cursor-pointer overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 bg-gray-900/95 border-gray-700 hover:border-blue-500/50"
        onClick={handleCardClick}
      >
        <div className="relative h-full">
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 animate-pulse" />
          )}
          
          {/* Main Image */}
          <img
            src={posterUrl}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-110`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
          
          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {/* Priority/Trending Badge */}
            {priority && (
              <div className="flex items-center space-x-1 bg-black/70 rounded-full px-2 py-1 backdrop-blur-sm">
                {getTrendingIcon()}
                <span className="text-white text-xs font-bold">HOT</span>
              </div>
            )}
            
            {/* Watched Badge */}
            {isWatched && (
              <Badge className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                ✓ Watched
              </Badge>
            )}

            {/* Watchlisted Badge */}
            {isWatchlisted && (
              <Badge className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full">
                <Bookmark className="h-3 w-3 mr-1" />
                List
              </Badge>
            )}
          </div>

          {/* Top Right - Rating */}
          <div className="absolute top-2 right-2">
            <div className={`flex items-center space-x-1 rounded-full px-2 py-1 backdrop-blur-sm ${getRatingColor(rating)}`}>
              <Star className="h-3 w-3 fill-current" />
              <span className="font-bold text-sm">
                {displayRating}
              </span>
            </div>
          </div>

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex space-x-2">
              {hasTrailer && (
                <Button
                  size="sm"
                  className="bg-red-600/90 hover:bg-red-700 text-white rounded-full h-10 w-10 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Play trailer for:', title);
                  }}
                >
                  <Play className="h-4 w-4 fill-white" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="secondary"
                className="bg-black/70 hover:bg-black/90 text-white rounded-full h-10 w-10 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </motion.div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <motion.div
              initial={{ y: 10, opacity: 0.8 }}
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* Title */}
              <h3 className="font-bold text-white mb-1 line-clamp-2 leading-tight text-sm">
                {title}
              </h3>
              
              {/* Subtitle Info */}
              <div className="text-gray-300 mb-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span>{year}</span>
                  {genre && (
                    <>
                      <span>•</span>
                      <span className="truncate">{genre.split(',')[0]}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Bar - pokazuje się przy hover */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs border-white/30 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Add to watchlist:', title);
                      }}
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      List
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs border-white/30 text-white hover:bg-white/20"
                      onClick={handleViewDetails}
                    >
                      Details
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Loading shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        </div>
      </Card>
    </motion.div>
  );
});

ImprovedMinimizedMovieCard.displayName = "ImprovedMinimizedMovieCard";
