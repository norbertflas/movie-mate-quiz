import { memo, useState, useCallback } from "react";
import { X, Star, Play, Calendar, Clock, MapPin, Heart, Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { MovieCardProps } from "@/types/movie";

export const SimpleMaximizedMovieCard = memo(({
  title = "Unknown Movie",
  year = "N/A", 
  imageUrl = '/placeholder.svg',
  description = "",
  rating = 0,
  genre = "",
  tmdbId,
  onClose,
  onMinimize,
  director,
  runtime,
  cast = [],
  budget,
  popularity = 0,
  personalRating = 0,
  isWatched = false,
  isWatchlisted = false,
  trailerUrl = "",
  ...props
}: MovieCardProps) => {
  const { toast } = useToast();
  const [userActions, setUserActions] = useState({
    isFavorite: false,
    isWatchlisted,
    personalRating
  });

  const formatDate = useCallback((dateString: string) => {
    if (!dateString || dateString === "N/A") return "Unknown";
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const formatRuntime = useCallback((minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  const getRatingColor = useCallback((rating: number) => {
    if (rating >= 8.0) return 'text-green-400';
    if (rating >= 7.0) return 'text-yellow-400';
    if (rating >= 6.0) return 'text-orange-400';
    return 'text-red-400';
  }, []);

  const handleUserAction = useCallback((action: string, value?: any) => {
    setUserActions(prev => ({
      ...prev,
      [action]: value !== undefined ? value : !prev[action as keyof typeof prev]
    }));
    
    toast({
      title: `Movie ${action === 'isFavorite' ? 'added to favorites' : 'added to watchlist'}`,
      description: `${title} has been updated`,
    });
  }, [title, toast]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
    if (onMinimize) onMinimize();
  }, [onClose, onMinimize]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out "${title}" - ${description.slice(0, 100)}...`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Movie link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [title, description, toast]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border"
      >
          {/* Header with backdrop */}
          <div className="relative h-64 overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white z-10"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Movie Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white"
              >
                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(year)}
                  </div>
                  {runtime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatRuntime(runtime)}
                    </div>
                  )}
                  {director && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {director}
                    </div>
                  )}
                </div>

                {/* Rating and Genre */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className={`text-xl font-bold ${getRatingColor(rating)}`}>
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  {genre && (
                    <Badge variant="secondary">
                      {genre}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {trailerUrl && (
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => window.open(trailerUrl, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2 fill-white" />
                      Watch Trailer
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUserAction('isFavorite')}
                    className={userActions.isFavorite ? 'bg-red-600/20 text-red-400 border-red-600/50' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${userActions.isFavorite ? 'fill-current' : ''}`} />
                    {userActions.isFavorite ? 'Favorite' : 'Add to Favorites'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUserAction('isWatchlisted')}
                    className={userActions.isWatchlisted ? 'bg-blue-600/20 text-blue-400 border-blue-600/50' : ''}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${userActions.isWatchlisted ? 'fill-current' : ''}`} />
                    {userActions.isWatchlisted ? 'On Watchlist' : 'Add to Watchlist'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="p-6">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Plot Summary</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {description || "No description available."}
                  </p>
                  
                  {/* Personal Rating */}
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <span className="font-medium">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ratingValue) => (
                        <button
                          key={ratingValue}
                          onClick={() => handleUserAction('personalRating', ratingValue)}
                          className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
                            ratingValue <= userActions.personalRating
                              ? 'bg-yellow-400 text-gray-900'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {ratingValue}
                        </button>
                      ))}
                    </div>
                    {userActions.personalRating > 0 && (
                      <span className="text-yellow-400 font-medium">
                        {userActions.personalRating}/10
                      </span>
                    )}
                  </div>

                  {/* Additional Info */}
                  {(cast.length > 0 || budget) && (
                    <div className="mt-6 space-y-3">
                      {cast.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Cast:</h4>
                          <p className="text-sm text-muted-foreground">
                            {cast.slice(0, 3).join(', ')}
                            {cast.length > 3 && ` and ${cast.length - 3} more...`}
                          </p>
                        </div>
                      )}
                      
                      {budget && (
                        <div>
                          <h4 className="font-medium mb-2">Budget:</h4>
                          <p className="text-sm text-muted-foreground">
                            ${budget.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    );
});

SimpleMaximizedMovieCard.displayName = "SimpleMaximizedMovieCard";