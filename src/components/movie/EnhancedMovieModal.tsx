import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useStreamingPro } from "@/hooks/use-streaming-pro";
import StreamingBadge from "../streaming/StreamingBadge";

interface EnhancedMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: TMDBMovie | null;
  explanations?: string[];
  streamingServices?: any[];
}

export const EnhancedMovieModal = ({ 
  isOpen = false,
  onClose,
  movie,
  explanations = [],
  streamingServices = []
}: EnhancedMovieModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [userActions, setUserActions] = useState({
    isFavorite: false,
    isWatchlisted: false,
    isWatched: false,
    personalRating: 0
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { fetchSingleMovie, getStreamingData } = useStreamingPro();

  // Format utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return 'text-green-400';
    if (rating >= 7.0) return 'text-yellow-400';
    if (rating >= 6.0) return 'text-orange-400';
    return 'text-red-400';
  };

  // Fetch detailed movie data from TMDB
  useEffect(() => {
    if (!movie || !isOpen) return;

    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        // Fetch detailed movie data from TMDB API
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=YOUR_API_KEY&append_to_response=credits,videos,images,similar,reviews&language=pl-PL`
        );
        
        if (response.ok) {
          const data = await response.json();
          setMovieDetails(data);
        } else {
          // Fallback to basic movie data with enhanced structure
          setMovieDetails({
            ...movie,
            runtime: 120,
            budget: 0,
            revenue: 0,
            status: "Released",
            production_companies: [{ name: "Unknown Studio" }],
            production_countries: [{ name: "Unknown" }],
            spoken_languages: [{ english_name: "English" }],
            credits: { cast: [], crew: [] },
            videos: { results: [] },
            images: { backdrops: [] },
            similar: { results: [] },
            reviews: { results: [] }
          });
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        // Use basic movie data as fallback
        setMovieDetails({
          ...movie,
          runtime: 120,
          budget: 0,
          revenue: 0,
          status: "Released",
          production_companies: [{ name: "Unknown Studio" }],
          production_countries: [{ name: "Unknown" }],
          spoken_languages: [{ english_name: "English" }],
          credits: { cast: [], crew: [] },
          videos: { results: [] },
          images: { backdrops: [] },
          similar: { results: [] },
          reviews: { results: [] }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
    
    // Fetch streaming data
    if (movie.id) {
      fetchSingleMovie(movie.id);
    }
  }, [movie, isOpen, fetchSingleMovie]);

  const handleUserAction = (action: string, value: any = null) => {
    setUserActions(prev => ({
      ...prev,
      [action]: value !== null ? value : !prev[action as keyof typeof prev]
    }));
  };

  const handleShare = async (platform: string) => {
    const shareData = {
      title: movie?.title || '',
      text: `Sprawdź "${movie?.title}" - ${movie?.overview?.slice(0, 100)}...`,
      url: `${window.location.origin}/movie/${movie?.id}`
    };

    switch(platform) {
      case 'copy':
        navigator.clipboard.writeText(shareData.url);
        break;
      case 'native':
        if (navigator.share) {
          await navigator.share(shareData);
        }
        break;
    }
    setShowShareMenu(false);
  };

  const streamingData = movie?.id ? getStreamingData(movie.id) : null;

  if (!isOpen || !movie) return null;

  if (loading || !movieDetails) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Ładowanie szczegółów filmu...</p>
        </div>
      </motion.div>
    );
  }

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
              src={movieDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : "/placeholder.svg"}
              alt={movieDetails.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-gray-900/40" />
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white z-10"
          >
            <X className="h-5 w-5" />
          </Button>

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
                  src={movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : "/placeholder.svg"}
                  alt={movieDetails.title}
                  className="w-32 h-48 object-cover rounded-lg shadow-2xl border-2 border-white/20"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
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
                  <h1 className="text-4xl font-bold mb-2">{movieDetails.title}</h1>
                  {movieDetails.original_title !== movieDetails.title && (
                    <p className="text-xl text-gray-300 italic mb-2">{movieDetails.original_title}</p>
                  )}
                  {movieDetails.tagline && (
                    <p className="text-lg text-gray-400 italic">"{movieDetails.tagline}"</p>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(movieDetails.release_date)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatRuntime(movieDetails.runtime || 120)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {movieDetails.production_countries?.[0]?.name || "Unknown"}
                  </div>
                  <Badge variant="outline" className="border-gray-400 text-gray-300">
                    {movieDetails.status || "Released"}
                  </Badge>
                </div>

                {/* Rating and Genres */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className={`text-xl font-bold ${getRatingColor(movieDetails.vote_average || 0)}`}>
                      {(movieDetails.vote_average || 0).toFixed(1)}
                    </span>
                    <span className="text-gray-400">({(movieDetails.vote_count || 0).toLocaleString()} votes)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">{(movieDetails.popularity || 0).toFixed(1)}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movieDetails.genres?.map((genre: any) => (
                    <Badge key={genre.id} className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                      {genre.name}
                    </Badge>
                  )) || movie.genre_ids?.map((genreId: number) => (
                    <Badge key={genreId} className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                      Genre {genreId}
                    </Badge>
                  ))}
                </div>

                {/* Streaming Services */}
                {streamingData?.streamingOptions && streamingData.streamingOptions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Dostępne na:</h4>
                    <StreamingBadge streamingOptions={streamingData.streamingOptions} mode="compact" maxServices={4} />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {movieDetails.videos?.results?.length > 0 && (
                    <Button
                      size="lg"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => setShowTrailer(true)}
                    >
                      <Play className="h-5 w-5 mr-2 fill-white" />
                      Obejrzyj Zwiastun
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleUserAction('isFavorite')}
                    className={`border-white/30 ${userActions.isFavorite ? 'bg-red-600/20 text-red-400 border-red-600/50' : 'text-white hover:bg-white/10'}`}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${userActions.isFavorite ? 'fill-current' : ''}`} />
                    {userActions.isFavorite ? 'Ulubione' : 'Dodaj do ulubionych'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleUserAction('isWatchlisted')}
                    className={`border-white/30 ${userActions.isWatchlisted ? 'bg-blue-600/20 text-blue-400 border-blue-600/50' : 'text-white hover:bg-white/10'}`}
                  >
                    <Bookmark className={`h-5 w-5 mr-2 ${userActions.isWatchlisted ? 'fill-current' : ''}`} />
                    {userActions.isWatchlisted ? 'Na liście' : 'Dodaj do listy'}
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Udostępnij
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
                            Kopiuj Link
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('native')}
                            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Udostępnij
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

        {/* Content Tabs */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-400px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
              <TabsTrigger value="overview">Przegląd</TabsTrigger>
              <TabsTrigger value="cast">Obsada</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="details">Szczegóły</TabsTrigger>
              <TabsTrigger value="reviews">Recenzje</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Opis fabularny</h3>
                    <p className="text-gray-300 leading-relaxed">{movieDetails.overview || movie.overview}</p>
                  </div>
                  
                  {/* Personal Rating */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                    <span className="text-white font-medium">Twoja ocena:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleUserAction('personalRating', rating)}
                          className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
                            rating <= userActions.personalRating
                              ? 'bg-yellow-400 text-gray-900'
                              : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    {userActions.personalRating > 0 && (
                      <span className="text-yellow-400 font-medium">{userActions.personalRating}/10</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Stats */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Statystyki filmu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ocena TMDB:</span>
                        <span className="text-white font-medium">{(movieDetails.vote_average || 0).toFixed(1)}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Głosy:</span>
                        <span className="text-white font-medium">{(movieDetails.vote_count || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Popularność:</span>
                        <span className="text-white font-medium">{(movieDetails.popularity || 0).toFixed(1)}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Wynik użytkowników</span>
                          <span className="text-white">{Math.round((movieDetails.vote_average || 0) * 10)}%</span>
                        </div>
                        <Progress value={(movieDetails.vote_average || 0) * 10} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Similar Movies */}
                  {movieDetails.similar?.results?.length > 0 && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Podobne filmy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          {movieDetails.similar.results.slice(0, 6).map((similarMovie: any) => (
                            <div key={similarMovie.id} className="text-center">
                              <img
                                src={similarMovie.poster_path ? `https://image.tmdb.org/t/p/w200${similarMovie.poster_path}` : "/placeholder.svg"}
                                alt={similarMovie.title}
                                className="w-full h-20 object-cover rounded mb-1"
                              />
                              <p className="text-xs text-gray-300 truncate">{similarMovie.title}</p>
                            </div>
                          ))}
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
                  <h3 className="text-xl font-semibold text-white mb-4">Główna obsada</h3>
                  <div className="space-y-3">
                    {movieDetails.credits?.cast?.slice(0, 8).map((actor: any) => (
                      <div key={actor.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{actor.name}</p>
                          <p className="text-gray-400 text-sm">{actor.character}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-400">Brak informacji o obsadzie</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Kluczowa ekipa</h3>
                  <div className="space-y-3">
                    {movieDetails.credits?.crew?.slice(0, 8).map((member: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          {member.department === 'Directing' && <Film className="h-5 w-5 text-gray-400" />}
                          {member.department === 'Writing' && <Edit3 className="h-5 w-5 text-gray-400" />}
                          {member.department === 'Camera' && <Camera className="h-5 w-5 text-gray-400" />}
                          {member.department === 'Sound' && <Mic className="h-5 w-5 text-gray-400" />}
                          {!['Directing', 'Writing', 'Camera', 'Sound'].includes(member.department) &&
                            <Users className="h-5 w-5 text-gray-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-gray-400 text-sm">{member.job}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-400">Brak informacji o ekipie</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Filmy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movieDetails.videos?.results?.map((video: any, index: number) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <h4 className="text-white font-medium text-sm">{video.name}</h4>
                      <p className="text-gray-400 text-xs">{video.type}</p>
                    </div>
                  )) || (
                    <p className="text-gray-400 col-span-2">Brak dostępnych filmów</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Informacje produkcyjne</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Budżet:</span>
                      <span className="text-white">{formatCurrency(movieDetails.budget || 0)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Przychody:</span>
                      <span className="text-white">{formatCurrency(movieDetails.revenue || 0)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">{movieDetails.status || "Released"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Czas trwania:</span>
                      <span className="text-white">{formatRuntime(movieDetails.runtime || 120)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Firmy i kraje</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Firmy produkcyjne:</h4>
                      {movieDetails.production_companies?.map((company: any, index: number) => (
                        <p key={index} className="text-white text-sm">• {company.name}</p>
                      )) || <p className="text-gray-400 text-sm">Brak informacji</p>}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Kraje:</h4>
                      {movieDetails.production_countries?.map((country: any, index: number) => (
                        <p key={index} className="text-white text-sm">• {country.name}</p>
                      )) || <p className="text-gray-400 text-sm">Brak informacji</p>}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Języki:</h4>
                      {movieDetails.spoken_languages?.map((lang: any, index: number) => (
                        <p key={index} className="text-white text-sm">• {lang.english_name}</p>
                      )) || <p className="text-gray-400 text-sm">Brak informacji</p>}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Recenzje użytkowników</h3>
                <div className="space-y-4">
                  {movieDetails.reviews?.results?.length > 0 ? (
                    movieDetails.reviews.results.map((review: any, index: number) => (
                      <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{review.author}</span>
                            {review.author_details?.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-white text-sm">{review.author_details.rating}/10</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed mb-2">
                            {review.content.length > 300 ? `${review.content.slice(0, 300)}...` : review.content}
                          </p>
                          <div className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-400">Brak dostępnych recenzji</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 flex items-center justify-center z-10"
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
                    <Play className="h-20 w-20 mx-auto mb-4 text-red-500" />
                    <h3 className="text-2xl font-bold mb-2">{movieDetails.title} - Zwiastun</h3>
                    <p className="text-gray-400 mb-4">
                      {movieDetails.videos?.results?.[0]?.name || "Oficjalny zwiastun"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Odtwarzacz wideo zostałby zintegrowany tutaj z YouTube/Vimeo
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="absolute -top-16 right-0 bg-gray-800 hover:bg-gray-700"
                onClick={() => setShowTrailer(false)}
              >
                <X className="h-5 w-5 mr-2" />
                Zamknij zwiastun
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};