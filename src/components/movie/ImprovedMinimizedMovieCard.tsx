
import { useState, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Maximize2, Play, Star, Eye, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { OptimizedMovieImage } from "./OptimizedMovieImage";
import { MovieRating } from "./MovieRating";
import type { MovieCardProps } from "@/types/movie";

export const ImprovedMinimizedMovieCard = memo(({
  title = "Unknown Movie",
  year = "N/A",
  imageUrl = '/placeholder.svg',
  rating = 0,
  tmdbId,
  onExpand,
  onClick,
  isWatched = false,
  isWatchlisted = false,
  hasTrailer = false,
  priority = false
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  }, []);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (onExpand) {
      onExpand();
    }
  }, [onClick, onExpand]);

  const handlePlayTrailer = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Playing trailer for:', title);
  }, [title]);

  const handleToggleWatched = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle watched for:', title);
  }, [title]);

  const handleToggleWatchlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle watchlist for:', title);
  }, [title]);

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand();
    }
  }, [onExpand]);

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        y: -2,
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`
          w-20 h-28 cursor-pointer transition-all duration-300 overflow-hidden group relative
          ${priority ? 'ring-2 ring-yellow-400/50' : ''}
          hover:shadow-xl border-gray-700 bg-gray-800
        `}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-full">
          <OptimizedMovieImage
            imageUrl={imageUrl}
            title={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* Status indicators */}
          <div className="absolute top-1 left-1 flex flex-col space-y-1">
            {isWatched && (
              <div className="w-2 h-2 bg-green-500 rounded-full ring-1 ring-green-300/50"></div>
            )}
            {isFavorite && (
              <div className="w-2 h-2 bg-red-500 rounded-full ring-1 ring-red-300/50"></div>
            )}
            {isWatchlisted && (
              <div className="w-2 h-2 bg-blue-500 rounded-full ring-1 ring-blue-300/50"></div>
            )}
          </div>

          {/* Priority badge */}
          {priority && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Hover overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60"
          >
            {/* Top controls */}
            <div className="absolute top-1 right-1 flex flex-col space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full"
                onClick={handleExpand}
              >
                <Maximize2 className="h-2.5 w-2.5 text-white" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full"
                onClick={handleToggleFavorite}
              >
                <Heart 
                  className={`h-2.5 w-2.5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                />
              </Button>

              {hasTrailer && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 bg-black/40 hover:bg-red-600/80 backdrop-blur-sm rounded-full"
                  onClick={handlePlayTrailer}
                >
                  <Play className="h-2.5 w-2.5 text-white fill-white" />
                </Button>
              )}
            </div>

            {/* Center quick actions */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex space-x-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full"
                  onClick={handleToggleWatched}
                >
                  <Eye className="h-2 w-2 text-white" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full"
                  onClick={handleToggleWatchlist}
                >
                  <Bookmark className="h-2 w-2 text-white" />
                </Button>
              </motion.div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-1">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.2 }}
              >
                <div className="mb-1">
                  <MovieRating rating={rating} />
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-white text-xs font-semibold truncate leading-tight">
                    {title}
                  </p>
                  <p className="text-white/80 text-xs leading-tight">
                    {year}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Priority glow effect */}
          {priority && (
            <div className="absolute inset-0 rounded-lg ring-1 ring-yellow-400/30 pointer-events-none" />
          )}

          {/* Loading shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        </div>
      </Card>
    </motion.div>
  );
});

ImprovedMinimizedMovieCard.displayName = "ImprovedMinimizedMovieCard";
