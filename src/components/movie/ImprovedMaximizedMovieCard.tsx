import { useState, useEffect, memo, useCallback } from "react";
import { 
  X, Heart, Star, Play, Calendar, Clock, Users, MapPin, 
  Award, TrendingUp, Eye, EyeOff, Bookmark, Share2, 
  Download, ExternalLink, Copy, ThumbsUp, ThumbsDown,
  Film, Camera, Mic, Edit3, DollarSign, Globe, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { MovieCardProps } from "@/types/movie";
import { getMovieDetails, getMovieReviews } from "@/services/tmdb/movies";
import { getMovieTrailer } from "@/services/youtube";

export const ImprovedMaximizedMovieCard = memo(({
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
  trailerUrl: initialTrailerUrl = "",
  ...props
}: MovieCardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(initialTrailerUrl);
  const [movieDetails, setMovieDetails] = useState(null);
  const [movieReviews, setMovieReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [userActions, setUserActions] = useState({
    isFavorite: false,
    isWatchlisted: isWatchlisted,
    isWatched: isWatched,
    personalRating: personalRating || 0
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [userReviews, setUserReviews] = useState([
    {
      id: 1,
      user: "MovieLover2024",
      rating: 9,
      review: "Absolutely incredible cinematography and storytelling. This movie left me speechless.",
      date: "2024-01-15",
      helpful: 23
    },
    {
      id: 2,
      user: "CinematicCritic",
      rating: 7,
      review: "Great performances and visual effects, though the pacing could have been better in the second act.",
      date: "2024-01-12",
      helpful: 18
    },
    {
      id: 3,
      user: "FilmFanatic",
      rating: 8,
      review: "A masterpiece that will be remembered for years to come. The soundtrack is particularly outstanding.",
      date: "2024-01-10",
      helpful: 31
    }
  ]);

  // Load comprehensive movie data if tmdbId is available
  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!tmdbId) return;
      
      try {
        setLoading(true);
        
        // Fetch comprehensive movie details
        const details = await getMovieDetails(tmdbId);
        setMovieDetails(details);
        
        // Fetch additional reviews if available
        if (details.reviews?.results?.length < 5) {
          const additionalReviews = await getMovieReviews(tmdbId);
          setMovieReviews(additionalReviews.results || []);
        } else {
          setMovieReviews(details.reviews?.results || []);
        }
        
        console.log('Comprehensive movie details loaded:', details);
      } catch (error) {
        console.error('Error loading movie details:', error);
        toast({
          title: "Error loading movie details",
          description: "Some movie information may be limited",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [tmdbId, toast]);

  const formatCurrency = useCallback((amount) => {
    if (!amount || amount === 0) return "Not disclosed";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const formatRuntime = useCallback((minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  const getRatingColor = useCallback((rating) => {
    const normalizedRating = rating > 10 ? rating / 10 : rating;
    if (normalizedRating >= 8.0) return 'text-green-400';
    if (normalizedRating >= 7.0) return 'text-yellow-400';
    if (normalizedRating >= 6.0) return 'text-orange-400';
    return 'text-red-400';
  }, []);

  const handleWatchTrailer = async () => {
    if (!trailerUrl) {
      try {
        setLoadingTrailer(true);
        
        // First try to get trailer from TMDB videos
        if (movieDetails?.videos?.results) {
          const trailer = movieDetails.videos.results.find(
            (video: any) => video.type === "Trailer" && video.site === "YouTube"
          );
          if (trailer) {
            setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
          }
        }
        
        // If no trailer found in TMDB, try YouTube search
        if (!trailerUrl) {
          const url = await getMovieTrailer(title, year);
          setTrailerUrl(url);
        }
        
        if (!trailerUrl) {
          toast({
            title: "Trailer not found",
            description: "Sorry, we couldn't find a trailer for this movie",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Error fetching trailer:', error);
        toast({
          title: "Error loading trailer",
          description: "Please try again later",
          variant: "destructive",
        });
        return;
      } finally {
        setLoadingTrailer(false);
      }
    }
    
    setShowTrailer(!showTrailer);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
  };

  const handleUserAction = useCallback((action, value = null) => {
    setUserActions(prev => ({
      ...prev,
      [action]: value !== null ? value : !prev[action]
    }));

    // Show toast feedback
    if (action === 'isFavorite') {
      toast({
        title: value || !userActions.isFavorite ? 'Added to favorites' : 'Removed from favorites',
        description: value || !userActions.isFavorite ? `"${title}" has been added to your favorites` : `"${title}" has been removed from favorites`,
      });
    } else if (action === 'isWatchlisted') {
      toast({
        title: value || !userActions.isWatchlisted ? 'Added to watchlist' : 'Removed from watchlist',
        description: value || !userActions.isWatchlisted ? `"${title}" has been added to your watchlist` : `"${title}" has been removed from watchlist`,
      });
    } else if (action === 'personalRating') {
      toast({
        title: 'Rating saved',
        description: `You rated "${title}" ${value}/10`,
      });
    }
  }, [userActions, toast, title]);

  const handleShare = useCallback(async (platform) => {
    const shareData = {
      title: title,
      text: `Check out "${title}" - ${description.slice(0, 100)}...`,
      url: `${window.location.origin}/movie/${tmdbId || title}`
    };

    try {
      switch(platform) {
        case 'copy':
          await navigator.clipboard.writeText(shareData.url);
          toast({
            title: 'Copied',
            description: 'Link copied to clipboard',
          });
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share(shareData);
          }
          break;
      }
    } catch (error) {
      console.error('Share error:', error);
    }
    setShowShareMenu(false);
  }, [title, description, tmdbId, toast]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleMinimizeClick = useCallback(() => {
    if (onMinimize) {
      onMinimize();
    }
  }, [onMinimize]);

  // Enhanced data preparation
  const posterUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : imageUrl?.startsWith('/') 
      ? `https://image.tmdb.org/t/p/w500${imageUrl}`
      : imageUrl || '/placeholder.svg';

  const backdropUrl = movieDetails?.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`
    : posterUrl;

  // Convert rating from 0-100 to 0-10 scale if needed
  const displayRating = rating > 10 ? (rating / 10).toFixed(1) : rating.toFixed(1);

  // Enhanced data from comprehensive movieDetails
  const genres = movieDetails?.genres || (genre ? genre.split(',').map((g, i) => ({ id: i, name: g.trim() })) : []);
  const castData = movieDetails?.credits?.cast?.slice(0, 15) || [];
  const crewData = movieDetails?.credits?.crew?.slice(0, 20) || [];
  const directors = crewData.filter(person => person.job === 'Director');
  const writers = crewData.filter(person => person.job === 'Writer' || person.job === 'Screenplay' || person.job === 'Story');
  const producers = crewData.filter(person => person.job === 'Producer' || person.job === 'Executive Producer');
  const cinematographers = crewData.filter(person => person.job === 'Director of Photography');
  const composers = crewData.filter(person => person.job === 'Original Music Composer');
  const editors = crewData.filter(person => person.job === 'Editor');

  // Enhanced reviews data
  const allReviews = movieReviews.length > 0 ? movieReviews : (movieDetails?.reviews?.results || []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-700"
      >
        {/* Enhanced Header */}
        <div className="relative h-96 overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-gray-900/40" />
          </div>

          {/* Close and Minimize Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 z-10">
            {onMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimizeClick}
                className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <EyeOff className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end space-x-6">
              {/* Poster */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-shrink-0"
              >
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-32 h-48 object-cover rounded-lg shadow-2xl border-2 border-white/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </motion.div>

              {/* Movie Info */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1 text-white"
              >
                <div className="mb-2">
                  <h1 className="text-4xl font-bold mb-2">{title}</h1>
                  {movieDetails?.original_title && movieDetails?.original_title !== title && (
                    <p className="text-xl text-gray-300 italic mb-2">"{movieDetails.original_title}"</p>
                  )}
                  {movieDetails?.tagline && (
                    <p className="text-lg text-gray-400 italic">"{movieDetails.tagline}"</p>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(movieDetails?.release_date || year)}
                  </div>
                  {(movieDetails?.runtime || runtime) && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatRuntime(movieDetails?.runtime || runtime)}
                    </div>
                  )}
                  {movieDetails?.production_countries?.[0]?.name && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {movieDetails.production_countries[0].name}
                    </div>
                  )}
                  <Badge variant="outline" className="border-gray-400 text-gray-300">
                    {movieDetails?.status || 'Released'}
                  </Badge>
                </div>

                {/* Rating and Popularity */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className={`text-xl font-bold ${getRatingColor(rating)}`}>
                      {displayRating}
                    </span>
                    <span className="text-gray-400">({movieDetails?.vote_count?.toLocaleString() || '0'} votes)</span>
                  </div>
                  {(movieDetails?.popularity || popularity > 0) && (
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">{(movieDetails?.popularity || popularity).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map((genre, index) => (
                    <Badge key={genre.id || index} className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleWatchTrailer}
                    disabled={loadingTrailer}
                  >
                    <Play className="h-5 w-5 mr-2 fill-white" />
                    {loadingTrailer ? 'Loading...' : 'Watch Trailer'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleUserAction('isFavorite')}
                    className={`border-white/30 ${userActions.isFavorite ? 'bg-red-600/20 text-red-400 border-red-600/50' : 'text-white hover:bg-white/10'}`}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${userActions.isFavorite ? 'fill-current' : ''}`} />
                    {userActions.isFavorite ? 'Favorite' : 'Add to Favorites'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleUserAction('isWatchlisted')}
                    className={`border-white/30 ${userActions.isWatchlisted ? 'bg-blue-600/20 text-blue-400 border-blue-600/50' : 'text-white hover:bg-white/10'}`}
                  >
                    <Bookmark className={`h-5 w-5 mr-2 ${userActions.isWatchlisted ? 'fill-current' : ''}`} />
                    {userActions.isWatchlisted ? 'On Watchlist' : 'Add to Watchlist'}
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </Button>
                    
                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-600 p-2 z-10 min-w-32"
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
              </motion.div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Tabs with ScrollArea */}
        <ScrollArea className="h-[50vh] p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Plot Summary</h3>
                    <p className="text-gray-300 leading-relaxed text-base">
                      {movieDetails?.overview || description || "No plot summary available."}
                    </p>
                  </div>
                  
                  {/* Enhanced Keywords Section */}
                  {movieDetails?.keywords?.keywords && movieDetails.keywords.keywords.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-white mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.keywords.keywords.slice(0, 10).map((keyword, index) => (
                          <Badge key={keyword.id || index} variant="outline" className="text-xs">
                            {keyword.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Director and Writers */}
                  {(directors.length > 0 || writers.length > 0) && (
                    <div className="space-y-3">
                      {directors.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-white mb-2">Director(s)</h4>
                          <div className="flex flex-wrap gap-2">
                            {directors.map((director, index) => (
                              <Badge key={index} variant="secondary" className="text-sm">
                                {director.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {writers.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium text-white mb-2">Writer(s)</h4>
                          <div className="flex flex-wrap gap-2">
                            {writers.map((writer, index) => (
                              <Badge key={index} variant="secondary" className="text-sm">
                                {writer.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enhanced Similar Movies */}
                  {movieDetails?.similar?.results && movieDetails.similar.results.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Similar Movies</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {movieDetails.similar.results.slice(0, 6).map((movie, index) => (
                          <div key={movie.id || index} className="bg-gray-800 rounded-lg p-3">
                            <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                            <p className="text-gray-400 text-xs">{movie.release_date?.split('-')[0] || 'N/A'}</p>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                              <span className="text-yellow-400 text-xs">{movie.vote_average?.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Personal Rating */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                    <span className="text-white font-medium">Your Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ratingValue) => (
                        <button
                          key={ratingValue}
                          onClick={() => handleUserAction('personalRating', ratingValue)}
                          className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
                            ratingValue <= userActions.personalRating
                              ? 'bg-yellow-400 text-gray-900'
                              : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                          }`}
                        >
                          {ratingValue}
                        </button>
                      ))}
                    </div>
                    {userActions.personalRating > 0 && (
                      <span className="text-yellow-400 font-medium">{userActions.personalRating}/10</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Enhanced Stats */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Movie Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">TMDb Rating:</span>
                        <span className="text-white font-medium">{displayRating}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Votes:</span>
                        <span className="text-white font-medium">{movieDetails?.vote_count?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Popularity:</span>
                        <span className="text-white font-medium">{(movieDetails?.popularity || popularity).toFixed(1)}</span>
                      </div>
                      {movieDetails?.imdb_id && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">IMDb ID:</span>
                          <span className="text-white font-medium">{movieDetails.imdb_id}</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">User Score</span>
                          <span className="text-white">{Math.round(parseFloat(displayRating) * 10)}%</span>
                        </div>
                        <Progress value={parseFloat(displayRating) * 10} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Quick Facts */}
                  {movieDetails && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Quick Facts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Release Date:</span>
                          <span className="text-white">{formatDate(movieDetails.release_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Runtime:</span>
                          <span className="text-white">{formatRuntime(movieDetails.runtime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Language:</span>
                          <span className="text-white">{movieDetails.original_language?.toUpperCase() || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-white">{movieDetails.status}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cast" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Main Cast</h3>
                  <div className="space-y-3">
                    {castData.length > 0 ? castData.map((actor, index) => (
                      <div key={actor.id || index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                          {actor.profile_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{actor.name}</p>
                          <p className="text-gray-400 text-sm">{actor.character || 'Unknown Role'}</p>
                          {actor.known_for_department && (
                            <p className="text-gray-500 text-xs">{actor.known_for_department}</p>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">Cast information not available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Crew</h3>
                  <div className="space-y-4">
                    {/* Directors */}
                    {directors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Directors</h4>
                        {directors.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                            <Film className="h-4 w-4 text-blue-400" />
                            <span className="text-white text-sm">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cinematographers */}
                    {cinematographers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Cinematography</h4>
                        {cinematographers.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                            <Camera className="h-4 w-4 text-green-400" />
                            <span className="text-white text-sm">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Composers */}
                    {composers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Music</h4>
                        {composers.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                            <Mic className="h-4 w-4 text-purple-400" />
                            <span className="text-white text-sm">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Editors */}
                    {editors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Editing</h4>
                        {editors.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                            <Edit3 className="h-4 w-4 text-orange-400" />
                            <span className="text-white text-sm">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Technical Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Original Title:</span>
                      <span className="text-white">{movieDetails?.original_title || title}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Original Language:</span>
                      <span className="text-white">{movieDetails?.original_language?.toUpperCase() || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Runtime:</span>
                      <span className="text-white">{formatRuntime(movieDetails?.runtime || runtime)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Release Date:</span>
                      <span className="text-white">{formatDate(movieDetails?.release_date)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">{movieDetails?.status || 'Released'}</span>
                    </div>
                    {movieDetails?.budget && movieDetails.budget > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Budget:</span>
                        <span className="text-white">{formatCurrency(movieDetails.budget)}</span>
                      </div>
                    )}
                    {movieDetails?.revenue && movieDetails.revenue > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Box Office:</span>
                        <span className="text-white">{formatCurrency(movieDetails.revenue)}</span>
                      </div>
                    )}
                    
                    {/* Enhanced certification information */}
                    {movieDetails?.release_dates?.results && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Rating:</span>
                        <span className="text-white">
                          {movieDetails.release_dates.results
                            .find(country => country.iso_3166_1 === 'US')
                            ?.release_dates?.[0]?.certification || 'Not Rated'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Additional Information</h3>
                  <div className="space-y-3">
                    {movieDetails?.production_companies && movieDetails.production_companies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Production Companies:</h4>
                        {movieDetails.production_companies.slice(0, 5).map((company, index) => (
                          <p key={index} className="text-white text-sm">• {company.name}</p>
                        ))}
                      </div>
                    )}
                    {movieDetails?.production_countries && movieDetails.production_countries.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Production Countries:</h4>
                        {movieDetails.production_countries.map((country, index) => (
                          <p key={index} className="text-white text-sm">• {country.name}</p>
                        ))}
                      </div>
                    )}
                    {movieDetails?.spoken_languages && movieDetails.spoken_languages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Spoken Languages:</h4>
                        {movieDetails.spoken_languages.map((language, index) => (
                          <p key={index} className="text-white text-sm">• {language.english_name || language.name}</p>
                        ))}
                      </div>
                    )}
                    
                    {/* Enhanced external IDs */}
                    {movieDetails?.external_ids && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">External Links:</h4>
                        <div className="space-y-1">
                          {movieDetails.external_ids.imdb_id && (
                            <p className="text-white text-sm">• IMDb: {movieDetails.external_ids.imdb_id}</p>
                          )}
                          {movieDetails.external_ids.facebook_id && (
                            <p className="text-white text-sm">• Facebook: {movieDetails.external_ids.facebook_id}</p>
                          )}
                          {movieDetails.external_ids.twitter_id && (
                            <p className="text-white text-sm">• Twitter: @{movieDetails.external_ids.twitter_id}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="production" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Production Info</h3>
                  <div className="space-y-4">
                    {producers.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-white mb-2">Producers</h4>
                        <div className="space-y-2">
                          {producers.map((producer, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                              <DollarSign className="h-4 w-4 text-yellow-400" />
                              <span className="text-white text-sm">{producer.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {movieDetails?.budget && movieDetails.budget > 0 && (
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <h4 className="text-lg font-medium text-white mb-2">Financial Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Production Budget:</span>
                            <span className="text-white font-medium">{formatCurrency(movieDetails.budget)}</span>
                          </div>
                          {movieDetails.revenue && movieDetails.revenue > 0 && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Worldwide Box Office:</span>
                                <span className="text-white font-medium">{formatCurrency(movieDetails.revenue)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Profit/Loss:</span>
                                <span className={`font-medium ${movieDetails.revenue > movieDetails.budget ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(movieDetails.revenue - movieDetails.budget)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Awards & Recognition</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Award className="h-5 w-5 text-yellow-400" />
                        <h4 className="text-lg font-medium text-white">Ratings Summary</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">TMDb Rating:</span>
                          <span className="text-white font-medium">{displayRating}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">User Score:</span>
                          <span className="text-white font-medium">{Math.round(parseFloat(displayRating) * 10)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Votes:</span>
                          <span className="text-white font-medium">{movieDetails?.vote_count?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Popularity Rank:</span>
                          <span className="text-white font-medium">#{Math.round(movieDetails?.popularity || popularity)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center py-8 text-gray-400">
                      <Award className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                      <p>Detailed awards information coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">User Reviews</h3>
                
                {/* Write a Review Section */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-medium">Your Rating:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                          <button
                            key={rating}
                            className="w-8 h-8 rounded bg-gray-600 text-gray-400 hover:bg-gray-500 text-sm font-semibold transition-colors"
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Share your thoughts about this movie..."
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      rows={4}
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>

                {/* Enhanced User Reviews List */}
                <div className="space-y-4">
                  {allReviews.length > 0 ? allReviews.map((review, index) => (
                    <Card key={review.id || index} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {(review.author || review.user || 'A').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{review.author || review.user || 'Anonymous'}</p>
                              <p className="text-gray-400 text-sm">
                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 
                                 review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-medium">
                              {review.author_details?.rating ? 
                                `${review.author_details.rating}/10` : 
                                review.rating ? `${review.rating}/10` : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3 leading-relaxed">
                          {review.content || review.review || 'No review content available.'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Helpful ({review.helpful || 0})
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Not Helpful
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            Reply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No reviews available for this movie</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </motion.div>

      {/* Enhanced Trailer Modal with Exit Button */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 flex items-center justify-center z-10"
            onClick={handleCloseTrailer}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-6xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Exit Button for Trailer */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-12 right-0 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                onClick={handleCloseTrailer}
              >
                <X className="h-5 w-5" />
              </Button>
              
              <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  {trailerUrl ? (
                    <iframe
                      src={trailerUrl.replace('watch?v=', 'embed/')}
                      title={`${title} trailer`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center text-white">
                      <Play className="h-20 w-20 mx-auto mb-4 text-red-500" />
                      <h3 className="text-2xl font-bold mb-2">{title} - Trailer</h3>
                      <p className="text-gray-400 mb-4">Official Movie Trailer</p>
                      <p className="text-sm text-gray-500">
                        Trailer not available at this time
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ImprovedMaximizedMovieCard.displayName = "ImprovedMaximizedMovieCard";
