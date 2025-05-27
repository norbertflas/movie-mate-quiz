
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Clock, Play, Heart, Bookmark, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getMovieTrailer } from "@/services/youtube";
import { useStreamingAvailabilityOfficial } from "@/hooks/use-streaming-availability-official";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  cast?: Array<{ name: string; character: string }>;
  director?: string;
  trailer_url?: string;
}

interface MovieCardProps {
  movie: Movie;
  isExpanded?: boolean;
  onExpand?: (movie: Movie) => void;
  onClose?: () => void;
  className?: string;
  variant?: 'small' | 'medium' | 'large';
  showExpandButton?: boolean;
}

// Unified Modal Component for fullscreen display
export const MovieModal = ({ 
  movie, 
  isOpen, 
  onClose 
}: { 
  movie: Movie | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");

  // Use official streaming availability API
  const streamingData = useStreamingAvailabilityOfficial(
    movie?.id || 0, 
    movie?.title, 
    movie?.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined,
    'pl' // Default to Poland, can be made configurable
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleAddToFavorites = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
    toast({
      title: isFavorite ? "Usunięto z ulubionych" : "Dodano do ulubionych",
      description: `${movie?.title} zostało ${isFavorite ? 'usunięte z' : 'dodane do'} ulubionych.`,
    });
  }, [isFavorite, movie?.title, toast]);

  const handleAddToWatchlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWatchlisted(prev => !prev);
    toast({
      title: isWatchlisted ? "Usunięto z listy do obejrzenia" : "Dodano do listy do obejrzenia",
      description: `${movie?.title} zostało ${isWatchlisted ? 'usunięte z' : 'dodane do'} listy do obejrzenia.`,
    });
  }, [isWatchlisted, movie?.title, toast]);

  const handleWatchTrailer = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!movie) return;
    
    if (!trailerUrl) {
      try {
        const year = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '';
        const url = await getMovieTrailer(movie.title, year);
        if (url) {
          setTrailerUrl(url);
          setShowTrailer(true);
        } else {
          toast({
            title: "Zwiastun niedostępny",
            description: "Nie udało się znaleźć zwiastuna dla tego filmu.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching trailer:', error);
        toast({
          title: "Błąd ładowania zwiastuna",
          description: "Spróbuj ponownie później.",
          variant: "destructive",
        });
      }
    } else {
      setShowTrailer(true);
    }
  }, [movie, trailerUrl, toast]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: movie?.title,
          text: `Sprawdź ${movie?.title}!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link skopiowany",
          description: "Link do filmu został skopiowany do schowka",
        });
      }
    } catch (error) {
      console.log('Sharing failed');
      toast({
        title: "Błąd udostępniania",
        description: "Nie udało się udostępnić filmu",
        variant: "destructive",
      });
    }
  }, [movie?.title, toast]);

  const checkStreamingAvailability = () => {
    if (!streamingData.requested) {
      streamingData.fetchData();
      toast({
        title: "Sprawdzanie dostępności",
        description: `Sprawdzam dostępność ${movie?.title} w serwisach streamingowych...`,
      });
    }
  };

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden rounded-xl"
          >
            <Card className="h-full w-full bg-background border-0 shadow-2xl overflow-hidden">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Content */}
              <div className="h-full overflow-y-auto">
                {/* Hero Section - Now can display trailer */}
                <div className="relative h-80 md:h-96">
                  {showTrailer && trailerUrl ? (
                    // Trailer View
                    <div className="absolute inset-0">
                      <iframe
                        src={trailerUrl}
                        title={`${movie.title} - Zwiastun`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      {/* Close trailer button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowTrailer(false)}
                        className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    // Poster/Backdrop View
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backdropUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                      
                      {/* Floating Poster */}
                      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                        <motion.img
                          src={posterUrl}
                          alt={movie.title}
                          className="w-32 md:w-40 lg:w-48 rounded-lg shadow-2xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      {/* Title and Rating */}
                      <div className="absolute bottom-4 left-40 md:left-52 lg:left-60 right-4 md:bottom-8 md:right-8">
                        <motion.h1
                          className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {movie.title}
                        </motion.h1>
                        
                        <div className="flex items-center gap-4 mb-3">
                          {movie.vote_average && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-white font-medium">
                                {movie.vote_average.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          {movie.release_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-300" />
                              <span className="text-gray-300">
                                {new Date(movie.release_date).getFullYear()}
                              </span>
                            </div>
                          )}
                          
                          {movie.runtime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-300" />
                              <span className="text-gray-300">
                                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Genres */}
                        {movie.genres && movie.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {movie.genres.slice(0, 3).map((genre) => (
                              <Badge key={genre.id} variant="secondary" className="bg-white/20 text-white border-0">
                                {genre.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Content Section */}
                <CardContent className="p-6 md:p-8">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button className="flex-1 min-w-32" onClick={handleWatchTrailer}>
                      <Play className="h-4 w-4 mr-2" />
                      {showTrailer ? 'Ukryj zwiastun' : 'Obejrzyj zwiastun'}
                    </Button>
                    <Button variant="outline" onClick={handleAddToFavorites}>
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                      {isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                    </Button>
                    <Button variant="outline" onClick={handleAddToWatchlist}>
                      <Bookmark className={`h-4 w-4 mr-2 ${isWatchlisted ? 'fill-current' : ''}`} />
                      {isWatchlisted ? 'Usuń z listy' : 'Dodaj do listy'}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Streaming Availability Section - Using Official API */}
                  <div className="mb-6 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Dostępność w serwisach (Oficjalne API)</h3>
                      {!streamingData.requested && (
                        <Button variant="outline" size="sm" onClick={checkStreamingAvailability}>
                          Sprawdź dostępność
                        </Button>
                      )}
                    </div>

                    {streamingData.isLoading ? (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-16 w-20 rounded-md" />
                        ))}
                      </div>
                    ) : streamingData.error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Nie udało się sprawdzić dostępności w serwisach streamingowych
                        </AlertDescription>
                      </Alert>
                    ) : streamingData.services && streamingData.services.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {streamingData.services.map((service, index) => (
                            <Button
                              key={`${service.service}-${index}`}
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => {
                                if (service.link) {
                                  window.open(service.link, '_blank');
                                } else {
                                  toast({
                                    title: "Link niedostępny",
                                    description: `Brak bezpośredniego linku do ${service.service}`,
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium">{service.service}</div>
                                <div className="text-xs text-muted-foreground">
                                  {service.type} {service.price && `- ${service.price}`}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dane z oficjalnego API Streaming Availability - zawsze aktualne!
                        </div>
                      </div>
                    ) : streamingData.requested ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Ten film nie jest obecnie dostępny w popularnych serwisach streamingowych w Polsce
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>

                  {/* Overview */}
                  {movie.overview && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Opis</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>
                  )}

                  {/* Cast */}
                  {movie.cast && movie.cast.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Obsada</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {movie.cast.slice(0, 6).map((actor, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="font-medium">{actor.name}</span>
                            <span className="text-muted-foreground">{actor.character}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Director */}
                  {movie.director && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Reżyser</h3>
                      <p className="text-muted-foreground">{movie.director}</p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Unified MovieCard Component
export const UnifiedMovieCard = ({
  movie,
  isExpanded = false,
  onExpand,
  onClose,
  className,
  variant = 'medium',
  showExpandButton = true
}: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleExpand = useCallback(() => {
    if (onExpand && !isExpanded) {
      onExpand(movie);
    }
  }, [movie, onExpand, isExpanded]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Get image URLs
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  // Size variants
  const sizeClasses = {
    small: "w-full max-w-48 h-72",
    medium: "w-full max-w-64 h-96", 
    large: "w-full max-w-80 h-[28rem]"
  };

  // Base card component
  const cardContent = (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300 bg-card hover:shadow-xl",
        sizeClasses[variant],
        isHovered && "scale-105 shadow-2xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleExpand}
    >
      {/* Movie Poster */}
      <div className="relative w-full h-full">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={posterUrl}
          alt={movie.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            isHovered && "scale-110"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 bottom-0 p-4 text-white"
            >
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {movie.title}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                {movie.vote_average && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
                
                {movie.release_date && (
                  <span className="text-sm text-gray-300">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}
              </div>

              {movie.overview && (
                <p className="text-sm text-gray-300 line-clamp-3 mb-3">
                  {movie.overview}
                </p>
              )}

              {showExpandButton && (
                <Button 
                  size="sm" 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand();
                  }}
                >
                  View Details
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating Badge */}
        {movie.vote_average && (
          <Badge 
            className="absolute top-2 right-2 bg-black/70 text-white border-0"
            variant="secondary"
          >
            ⭐ {movie.vote_average.toFixed(1)}
          </Badge>
        )}

        {/* Close Button for expanded state */}
        {isExpanded && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-2 left-2 z-10 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );

  return cardContent;
};

// Hook for managing modal state
export const useMovieModal = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing the movie to allow exit animation
    setTimeout(() => setSelectedMovie(null), 300);
  }, []);

  return {
    selectedMovie,
    isModalOpen,
    openModal,
    closeModal
  };
};
