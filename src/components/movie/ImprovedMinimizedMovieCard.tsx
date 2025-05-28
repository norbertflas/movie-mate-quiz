
import { useState, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, Play, Heart, Bookmark, TrendingUp,
  Flame, Zap, Calendar, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
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
  size = "medium", // small, medium, large
  trendingPosition,
  isHot = false,
  description = "",
}: MovieCardProps & {
  size?: "small" | "medium" | "large";
  trendingPosition?: number;
  isHot?: boolean;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchlisted, setWatchlisted] = useState(isWatchlisted);

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

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? t('ratings.saved') : t('common.removed'),
      description: !isFavorite ? t('ratings.savedDescription', { title }) : t('common.removedFromFavorites', { title }),
    });
  }, [isFavorite, toast, t, title]);

  const handleToggleWatchlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlisted(!watchlisted);
    toast({
      title: !watchlisted ? t('common.addedToWatchlist') : t('common.removedFromWatchlist'),
      description: !watchlisted ? t('common.addedToWatchlistDescription', { title }) : t('common.removedFromWatchlistDescription', { title }),
    });
  }, [watchlisted, toast, t, title]);

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
    if (trendingPosition && trendingPosition <= 3) return <Flame className="h-3 w-3 text-red-500" />;
    if (priority) return <Flame className="h-3 w-3 text-red-500" />;
    return <TrendingUp className="h-3 w-3 text-orange-500" />;
  };

  // Card sizes configuration
  const cardSizes = {
    small: "w-32 h-48",
    medium: "w-40 h-60", 
    large: "w-48 h-72"
  };

  const textSizes = {
    small: { title: "text-xs", subtitle: "text-xs", rating: "text-xs" },
    medium: { title: "text-sm", subtitle: "text-xs", rating: "text-sm" },
    large: { title: "text-base", subtitle: "text-sm", rating: "text-base" }
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
        className={`
          ${cardSizes[size]} cursor-pointer overflow-hidden relative group
          transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20
          bg-gray-900/95 border-gray-700 hover:border-blue-500/50
        `}
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
            {/* Trending Position */}
            {trendingPosition && (
              <div className="flex items-center space-x-1 bg-black/70 rounded-full px-2 py-1 backdrop-blur-sm">
                {getTrendingIcon()}
                <span className="text-white text-xs font-bold">#{trendingPosition}</span>
              </div>
            )}

            {/* Priority/Hot Badge */}
            {(priority || isHot) && (
              <div className="flex items-center space-x-1 bg-black/70 rounded-full px-2 py-1 backdrop-blur-sm">
                {getTrendingIcon()}
                <span className="text-white text-xs font-bold">{t('common.hot')}</span>
              </div>
            )}
            
            {/* Watched Badge */}
            {isWatched && (
              <Badge className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                ✓ {t('common.watched')}
              </Badge>
            )}

            {/* Watchlisted Badge */}
            {watchlisted && (
              <Badge className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full">
                <Bookmark className="h-3 w-3 mr-1" />
                {t('common.list')}
              </Badge>
            )}
          </div>

          {/* Top Right - Rating */}
          <div className="absolute top-2 right-2">
            <div className={`flex items-center space-x-1 rounded-full px-2 py-1 backdrop-blur-sm ${getRatingColor(rating)}`}>
              <Star className="h-3 w-3 fill-current" />
              <span className={`font-bold ${textSizes[size].rating}`}>
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
                onClick={handleToggleFavorite}
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
              <h3 className={`font-bold text-white mb-1 line-clamp-2 leading-tight ${textSizes[size].title}`}>
                {title}
              </h3>
              
              {/* Subtitle Info */}
              <div className={`text-gray-300 mb-2 ${textSizes[size].subtitle}`}>
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

              {/* Description - tylko dla większych kart przy hover */}
              {size !== 'small' && isHovered && description && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-gray-300 text-xs line-clamp-2 leading-relaxed mb-2"
                >
                  {description}
                </motion.p>
              )}

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
                      onClick={handleToggleWatchlist}
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      {t('common.list')}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs border-white/30 text-white hover:bg-white/20"
                      onClick={handleViewDetails}
                    >
                      {t('common.details')}
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
