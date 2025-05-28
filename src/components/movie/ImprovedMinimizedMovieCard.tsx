
import { useState, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { MovieCardProps } from "@/types/movie";

export const ImprovedMinimizedMovieCard = memo(({
  title = "Unknown Movie",
  year = "N/A",
  imageUrl = '/placeholder.svg',
  rating = 0,
  tmdbId,
  onExpand,
  onClick,
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="w-full max-w-64"
    >
      <Card 
        className="h-96 cursor-pointer transition-all duration-300 overflow-hidden group relative bg-gray-900 border-gray-700"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-full">
          {/* Main image */}
          <div className="w-full h-full overflow-hidden relative">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 animate-pulse" />
            )}
            
            <img
              src={posterUrl}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>

          {/* Rating badge in top right corner */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-medium">
                {displayRating}
              </span>
            </div>
          </div>

          {/* Movie title at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-lg font-bold leading-tight mb-1 line-clamp-2">
              {title}
            </h3>
            <p className="text-white/80 text-sm">
              {year}
            </p>
          </div>

          {/* Hover overlay with View Details button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <Button 
              onClick={handleViewDetails}
              className="bg-white/90 text-black hover:bg-white font-semibold px-6 py-2 rounded-full"
            >
              Zobacz szczegóły
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
});

ImprovedMinimizedMovieCard.displayName = "ImprovedMinimizedMovieCard";
