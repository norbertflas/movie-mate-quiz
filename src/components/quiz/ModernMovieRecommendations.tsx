import { useState } from "react";
import { 
  Star, Play, Heart, Bookmark, Share2, Info, 
  Sparkles, TrendingUp, Clock, Calendar, Award,
  ChevronRight, Filter, Shuffle, MoreHorizontal,
  ExternalLink, Check, Plus, Zap, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EnhancedMovieModal } from "@/components/movie/EnhancedMovieModal";
import type { Movie } from "@/types/movie";

interface ModernMovieRecommendationsProps {
  movies: Movie[];
  quizResults?: {
    genres: string[];
    mood: string;
    era: string;
    platforms: number;
    totalFound: number;
  };
}

export const ModernMovieRecommendations = ({ 
  movies, 
  quizResults = {
    genres: ["Drama", "Comedy"],
    mood: "Empowering & Fun",
    era: "2000s Golden Era",
    platforms: 3,
    totalFound: 847
  }
}: ModernMovieRecommendationsProps) => {
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
  const [favorites, setFavorites] = useState(new Set([2, 4]));
  const [watchlist, setWatchlist] = useState(new Set([1, 3, 5]));
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleToggleFavorite = (movieId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(movieId)) {
      newFavorites.delete(movieId);
    } else {
      newFavorites.add(movieId);
    }
    setFavorites(newFavorites);
  };

  const handleToggleWatchlist = (movieId: number) => {
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(movieId)) {
      newWatchlist.delete(movieId);
    } else {
      newWatchlist.add(movieId);
    }
    setWatchlist(newWatchlist);
  };

  const getMatchScore = (movie: Movie) => {
    // Calculate match score based on movie data
    return Math.floor(Math.random() * 20) + 80; // Mock for now
  };

  const getMatchColor = (score: number) => {
    if (score >= 95) return "from-green-400 to-emerald-500";
    if (score >= 90) return "from-blue-400 to-cyan-500";
    if (score >= 85) return "from-yellow-400 to-orange-500";
    return "from-purple-400 to-pink-500";
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 pt-16 pb-8"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/20 backdrop-blur-xl border border-border rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-primary">
                AI-Powered Recommendations
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
              <span className="text-foreground">
                Your Perfect
              </span>
              <br />
              <span className="text-primary">
                Movie Match
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              We analyzed {quizResults.totalFound.toLocaleString()} movies and found your perfect matches
            </p>

            {/* Quiz Results Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-primary/20 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-primary">{quizResults.genres.join(" • ")}</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-secondary/20 backdrop-blur-xl border border-secondary/20 rounded-full px-4 py-2"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 w-3 text-secondary" />
                  <span className="text-sm font-medium text-secondary">{quizResults.mood}</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-accent/20 backdrop-blur-xl border border-accent/20 rounded-full px-4 py-2"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-accent" />
                  <span className="text-sm font-medium text-accent">{quizResults.era}</span>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button 
                variant="outline" 
                className="border-border text-foreground hover:bg-accent/10 backdrop-blur-xl px-8 py-3 rounded-full font-semibold"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                New Recommendations
              </Button>
              <Button 
                variant="outline" 
                className="border-border text-foreground hover:bg-accent/10 backdrop-blur-xl px-8 py-3 rounded-full font-semibold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Refine Results
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Movies Grid */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {movies.map((movie, index) => {
              const matchScore = getMatchScore(movie);
              const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
              const genres = Array.isArray(movie.genres) 
                ? movie.genres.map(g => typeof g === 'string' ? g : g.name).slice(0, 2)
                : [];

              return (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  onHoverStart={() => setHoveredMovie(movie.id)}
                  onHoverEnd={() => setHoveredMovie(null)}
                  className="group relative"
                >
                  {/* Movie Card */}
                  <div className="relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-xl border border-border hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20">
                    
                    {/* Match Score */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className={`bg-gradient-to-r ${getMatchColor(matchScore)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                        {matchScore}% Match
                      </div>
                    </div>

                    {/* Movie Poster */}
                    <div className="aspect-[2/3] relative overflow-hidden rounded-t-3xl">
                      <motion.img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/api/placeholder/300/450"}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/300/450";
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Hover Actions */}
                      <AnimatePresence>
                        {hoveredMovie === movie.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                          >
                            <div className="flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleFavorite(movie.id)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all ${
                                  favorites.has(movie.id)
                                    ? 'bg-destructive/20 border-destructive/50 text-destructive'
                                    : 'bg-background/10 border-border text-foreground hover:bg-background/20'
                                }`}
                              >
                                <Heart className={`h-5 w-5 ${favorites.has(movie.id) ? 'fill-current' : ''}`} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleWatchlist(movie.id)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all ${
                                  watchlist.has(movie.id)
                                    ? 'bg-primary/20 border-primary/50 text-primary'
                                    : 'bg-background/10 border-border text-foreground hover:bg-background/20'
                                }`}
                              >
                                {watchlist.has(movie.id) ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  <Plus className="h-5 w-5" />
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleMovieClick(movie)}
                                className="w-12 h-12 rounded-full bg-background/10 backdrop-blur-xl border border-border text-foreground hover:bg-background/20 flex items-center justify-center transition-all"
                              >
                                <Info className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Movie Info */}
                    <div className="p-6 space-y-4">
                      {/* Title & Year */}
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">
                          {movie.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{year}</span>
                          {movie.runtime && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{movie.runtime}m</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-foreground font-semibold">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Genres */}
                      {genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {genres.map((genre, i) => (
                            <span 
                              key={i}
                              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMovieClick(movie)}
                        className="w-full bg-primary/80 hover:bg-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm backdrop-blur-xl border border-border transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Info className="h-4 w-4" />
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Movie Modal */}
      {selectedMovie && (
        <EnhancedMovieModal
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          movie={{
            title: selectedMovie.title,
            platform: "TMDB",
            genre: Array.isArray(selectedMovie.genres) && selectedMovie.genres.length > 0 
              ? (typeof selectedMovie.genres[0] === 'string' ? selectedMovie.genres[0] : selectedMovie.genres[0].name)
              : "Unknown",
            imageUrl: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : "",
            description: selectedMovie.overview || "",
            trailerUrl: "",
            rating: selectedMovie.vote_average ? selectedMovie.vote_average * 10 : 0,
            tmdbId: selectedMovie.id,
            runtime: selectedMovie.runtime,
            director: typeof selectedMovie.director === 'string' ? selectedMovie.director : selectedMovie.director?.[0],
            cast: Array.isArray(selectedMovie.cast) 
              ? selectedMovie.cast.map(c => typeof c === 'string' ? c : c.name)
              : [],
            releaseDate: selectedMovie.release_date
          } as any}
        />
      )}

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="bg-card/30 backdrop-blur-2xl border border-border rounded-3xl p-8 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">Love what you see?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get personalized recommendations every week based on your evolving taste and new releases.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold">
                Save My Preferences
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-border text-foreground hover:bg-accent/10 backdrop-blur-xl px-8 py-3 rounded-full font-semibold"
              >
                Explore More Movies
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};