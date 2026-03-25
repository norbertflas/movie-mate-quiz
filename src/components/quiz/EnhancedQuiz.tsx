
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, Users, 
  Trophy, Star, Laugh, Zap, Heart, Brain, Film, Tv, BookOpen, Clapperboard,
  Sofa, PartyPopper, Baby, Monitor, MessageCircle, RotateCcw, ThumbsDown,
  Clock, Popcorn, Globe, Palette, Drama, Flame, Shield, Link2, Copy, Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserStats, Challenge } from "./types/GamificationTypes";
import { Movie } from "@/types/movie";
import { AchievementSystem } from "./engines/AchievementSystem";

interface EnhancedQuizProps {
  onBack?: () => void;
  onComplete?: (results: any) => void;
  userPreferences?: any;
}

interface QuizStep {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "multiple" | "rating";
  options: { label: string; icon: React.ReactNode; }[];
  category: 'basic' | 'preferences' | 'social' | 'gamification' | 'streaming';
}

const STREAMING_SERVICES = [
  { label: 'Netflix', icon: <Film className="w-8 h-8" /> },
  { label: 'HBO Max', icon: <Tv className="w-8 h-8" /> },
  { label: 'Disney+', icon: <Sparkles className="w-8 h-8" /> },
  { label: 'Amazon Prime Video', icon: <Star className="w-8 h-8" /> },
  { label: 'Apple TV+', icon: <Monitor className="w-8 h-8" /> },
  { label: 'Hulu', icon: <Zap className="w-8 h-8" /> },
  { label: 'Paramount+', icon: <Clapperboard className="w-8 h-8" /> },
  { label: 'Canal+', icon: <Film className="w-8 h-8" /> },
  { label: 'SkyShowtime', icon: <Globe className="w-8 h-8" /> },
  { label: 'Player', icon: <Monitor className="w-8 h-8" /> },
];

const quizSteps: QuizStep[] = [
  {
    id: 'streaming_services',
    question: 'Which streaming services do you use?',
    subtitle: 'Select all that apply — we\'ll find movies on your platforms',
    type: 'multiple',
    options: STREAMING_SERVICES,
    category: 'streaming'
  },
  {
    id: 'content_type',
    question: 'What type of content do you enjoy?',
    type: 'single',
    options: [
      { label: 'Movies', icon: <Film className="w-10 h-10" /> },
      { label: 'TV Series', icon: <Tv className="w-10 h-10" /> },
      { label: 'Documentaries', icon: <BookOpen className="w-10 h-10" /> },
      { label: 'Mixed Content', icon: <Clapperboard className="w-10 h-10" /> },
    ],
    category: 'basic'
  },
  {
    id: 'mood_preference',
    question: 'What is your current mood?',
    type: 'single',
    options: [
      { label: 'Need a laugh', icon: <Laugh className="w-10 h-10" /> },
      { label: 'Edge of my seat', icon: <Zap className="w-10 h-10" /> },
      { label: 'Something romantic', icon: <Heart className="w-10 h-10" /> },
      { label: 'Mind-bending', icon: <Brain className="w-10 h-10" /> },
    ],
    category: 'preferences'
  },
  {
    id: 'era_preference',
    question: 'What era of movies do you prefer?',
    type: 'single',
    options: [
      { label: 'Latest (2023-2025)', icon: <Sparkles className="w-10 h-10" /> },
      { label: 'Modern (2010-2022)', icon: <Zap className="w-10 h-10" /> },
      { label: 'Classic (2000s & older)', icon: <Clock className="w-10 h-10" /> },
      { label: 'No preference', icon: <Globe className="w-10 h-10" /> },
    ],
    category: 'preferences'
  },
  {
    id: 'social_watching',
    question: 'How do you like to watch?',
    type: 'single',
    options: [
      { label: 'Solo binge sessions', icon: <Sofa className="w-10 h-10" /> },
      { label: 'Movie nights with friends', icon: <PartyPopper className="w-10 h-10" /> },
      { label: 'Family time', icon: <Baby className="w-10 h-10" /> },
      { label: 'Online watch parties', icon: <Monitor className="w-10 h-10" /> },
    ],
    category: 'social'
  },
  {
    id: 'genre_rating',
    question: 'Rate your genre preferences',
    subtitle: 'Star the genres you love most',
    type: 'rating',
    options: [
      { label: 'Action & Adventure', icon: <Zap className="w-5 h-5" /> },
      { label: 'Comedy', icon: <Laugh className="w-5 h-5" /> },
      { label: 'Drama', icon: <Film className="w-5 h-5" /> },
      { label: 'Horror & Thriller', icon: <Brain className="w-5 h-5" /> },
      { label: 'Science Fiction', icon: <Sparkles className="w-5 h-5" /> },
      { label: 'Romance', icon: <Heart className="w-5 h-5" /> },
      { label: 'Documentary', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Animation', icon: <Clapperboard className="w-5 h-5" /> },
    ],
    category: 'preferences'
  },
  {
    id: 'movie_length',
    question: 'How long should the movie be?',
    type: 'single',
    options: [
      { label: 'Short (< 90 min)', icon: <Clock className="w-10 h-10" /> },
      { label: 'Standard (90-120 min)', icon: <Film className="w-10 h-10" /> },
      { label: 'Long (2h+)', icon: <Clapperboard className="w-10 h-10" /> },
      { label: 'No preference', icon: <Globe className="w-10 h-10" /> },
    ],
    category: 'preferences'
  },
];

// Sample movie pool for recommendations
const MOVIE_POOL: Movie[] = [
  {
    id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg",
    overview: "A depressed man suffering from insomnia meets a strange soap salesman and forms an underground fight club that evolves into much more.",
    release_date: "1999-10-15", vote_average: 8.4, runtime: 139,
    genres: [{ id: 18, name: "Drama" }, { id: 53, name: "Thriller" }],
    genre: "Drama", vote_count: 26000, popularity: 60, cast: [], tmdbId: 550
  },
  {
    id: 680, title: "Pulp Fiction", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    release_date: "1994-09-10", vote_average: 8.5, runtime: 154,
    genres: [{ id: 53, name: "Thriller" }, { id: 80, name: "Crime" }],
    genre: "Thriller", vote_count: 25000, popularity: 70, cast: [], tmdbId: 680
  },
  {
    id: 155, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911BTUgMe1nHJKQ.jpg",
    backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",
    overview: "When the menace known as the Joker wreaks havoc on Gotham, Batman must face one of the greatest tests of his ability to fight injustice.",
    release_date: "2008-07-14", vote_average: 8.5, runtime: 152,
    genres: [{ id: 18, name: "Drama" }, { id: 28, name: "Action" }, { id: 80, name: "Crime" }],
    genre: "Action", vote_count: 30000, popularity: 80, cast: [], tmdbId: 155
  },
  {
    id: 13, title: "Forrest Gump", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c9UVPPiTPltouxRVY6N9uugaVA.jpg",
    overview: "The presidencies of Kennedy and Johnson, Vietnam, Watergate through the eyes of an Alabama man with an IQ of 75.",
    release_date: "1994-07-06", vote_average: 8.5, runtime: 142,
    genres: [{ id: 35, name: "Comedy" }, { id: 18, name: "Drama" }, { id: 10749, name: "Romance" }],
    genre: "Drama", vote_count: 24000, popularity: 65, cast: [], tmdbId: 13
  },
  {
    id: 278, title: "The Shawshank Redemption", poster_path: "/9cjIGRiQMVhxPavNbVe0YkpgiVM.jpg",
    backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    overview: "Imprisoned in the 1940s for the double murder of his wife and her lover, Andy Dufresne begins to slowly gain the respect of fellow inmates.",
    release_date: "1994-09-23", vote_average: 8.7, runtime: 142,
    genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }],
    genre: "Drama", vote_count: 24000, popularity: 75, cast: [], tmdbId: 278
  },
];

const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({ onBack, onComplete, userPreferences = {} }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [likedMovie, setLikedMovie] = useState<Movie | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const currentQuizStep = quizSteps[currentStep];
  const totalSteps = quizSteps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswerChange = (stepId: string, answer: any) => {
    if (currentQuizStep.type === 'multiple') {
      const current: string[] = answers[stepId] || [];
      if (current.includes(answer)) {
        setAnswers(prev => ({ ...prev, [stepId]: current.filter(a => a !== answer) }));
      } else {
        setAnswers(prev => ({ ...prev, [stepId]: [...current, answer] }));
      }
    } else {
      setAnswers(prev => ({ ...prev, [stepId]: answer }));
    }
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuizStep.id];
    if (currentQuizStep.type === 'multiple') {
      if (!currentAnswer || currentAnswer.length === 0) {
        toast({ title: "Select at least one option", description: "Pick your streaming services.", variant: "destructive" });
        return;
      }
    } else if (!currentAnswer && currentQuizStep.type !== 'rating') {
      toast({ title: "Please select an answer", description: "Choose an option before continuing.", variant: "destructive" });
      return;
    }
    if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
    else onBack?.();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Shuffle and pick 5 movies
      const shuffled = [...MOVIE_POOL].sort(() => Math.random() - 0.5);
      setRecommendations(shuffled.slice(0, 5));
      setCurrentMovieIndex(0);
      setLikedMovie(null);
      setShowResults(true);
      onComplete?.({ answers, recommendations: shuffled.slice(0, 5) });
      toast({ title: "Quiz completed! 🎉", description: "Here's your first recommendation." });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowNextMovie = () => {
    if (currentMovieIndex < recommendations.length - 1) {
      setCurrentMovieIndex(prev => prev + 1);
    }
  };

  const handleLikeMovie = (movie: Movie) => {
    setLikedMovie(movie);
    toast({ title: `❤️ ${movie.title} added!`, description: "Great choice! You can find it in your favorites." });
  };

  const handleRetakeQuiz = () => {
    setShowResults(false);
    setCurrentStep(0);
    setAnswers({});
    setRecommendations([]);
    setCurrentMovieIndex(0);
    setLikedMovie(null);
  };

  const currentMovie = recommendations[currentMovieIndex];
  const isLastMovie = currentMovieIndex >= recommendations.length - 1;
  const moviesRemaining = recommendations.length - currentMovieIndex - 1;

  // ─── RESULTS VIEW ─── one movie at a time
  if (showResults && currentMovie) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-sm text-muted-foreground mb-1">
            Recommendation {currentMovieIndex + 1} of {recommendations.length}
          </p>
          <div className="flex justify-center gap-2 mb-4">
            {recommendations.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all ${
                  i === currentMovieIndex
                    ? 'bg-accent shadow-lg shadow-accent/50'
                    : i < currentMovieIndex
                    ? 'bg-primary/40'
                    : 'bg-secondary/50'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Movie Card - Large cinematic display */}
            <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/50 backdrop-blur-xl">
              {/* Backdrop */}
              <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                <img
                  src={currentMovie.backdrop_path
                    ? `https://image.tmdb.org/t/p/w1280${currentMovie.backdrop_path}`
                    : `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`
                  }
                  alt={currentMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Match Score */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                    {Math.floor(Math.random() * 15) + 85}% Match
                  </div>
                </div>

                {/* Rating */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-foreground">{currentMovie.vote_average?.toFixed(1)}</span>
                </div>
              </div>

              {/* Info section */}
              <div className="p-6 md:p-8 -mt-16 relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">
                  {currentMovie.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
                  {currentMovie.release_date && (
                    <span>{new Date(currentMovie.release_date).getFullYear()}</span>
                  )}
                  {currentMovie.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {currentMovie.runtime} min
                    </span>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Array.isArray(currentMovie.genres) ? currentMovie.genres : []).map((genre, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                      {typeof genre === 'string' ? genre : genre.name}
                    </Badge>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg max-w-3xl">
                  {currentMovie.overview}
                </p>

                {/* Streaming availability from answers */}
                {answers.streaming_services && answers.streaming_services.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Your platforms</p>
                    <div className="flex flex-wrap gap-2">
                      {answers.streaming_services.map((service: string) => (
                        <Badge key={service} className="bg-accent/10 text-accent border border-accent/20 text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() => handleLikeMovie(currentMovie)}
                    disabled={likedMovie?.id === currentMovie.id}
                    className="flex-1 rounded-xl btn-gradient text-base font-bold"
                  >
                    {likedMovie?.id === currentMovie.id ? (
                      <>
                        <Check className="w-5 h-5 mr-2" /> Added to Favorites
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 mr-2" /> I like this one!
                      </>
                    )}
                  </Button>

                  {!isLastMovie ? (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleShowNextMovie}
                      className="flex-1 rounded-xl border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    >
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Show another ({moviesRemaining} left)
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleRetakeQuiz}
                      className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Nothing fits — retake quiz
                    </Button>
                  )}
                </div>

                {/* Secondary retake on non-last movies */}
                {!isLastMovie && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={handleRetakeQuiz}
                      className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      Start over with a new quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── QUIZ STEPS VIEW ───
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Progress */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Question {currentStep + 1} of {totalSteps}</p>
        <div className="relative h-2 w-full rounded-full bg-secondary/50 border border-border/20 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))' }}
            initial={false}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent shadow-lg shadow-accent/50 border-2 border-white/30"
            initial={false}
            animate={{ left: `calc(${progressPercentage}% - 8px)` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}>
          
          {/* Question */}
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 text-gradient-neon">
            {currentQuizStep.question}
          </h2>
          {currentQuizStep.subtitle && (
            <p className="text-center text-muted-foreground mb-8 text-sm md:text-base">
              {currentQuizStep.subtitle}
            </p>
          )}

          {/* Multiple select (streaming services) */}
          {currentQuizStep.type === 'multiple' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {currentQuizStep.options.map((option, index) => {
                const selected: string[] = answers[currentQuizStep.id] || [];
                const isSelected = selected.includes(option.label);
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAnswerChange(currentQuizStep.id, option.label)}
                    className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 min-h-[120px] ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                        : 'border-border/40 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50'
                    }`}>
                    <div className={`transition-colors ${isSelected ? 'text-accent' : 'text-neon-cyan'}`}>
                      {option.icon}
                    </div>
                    <span className={`text-sm font-semibold text-center leading-tight ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Single select */}
          {currentQuizStep.type === 'single' && (
            <div className="grid grid-cols-2 gap-5 max-w-3xl mx-auto">
              {currentQuizStep.options.map((option, index) => {
                const isSelected = answers[currentQuizStep.id] === option.label;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAnswerChange(currentQuizStep.id, option.label)}
                    className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 min-h-[160px] ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                        : 'border-border/40 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50'
                    }`}>
                    <div className={`transition-colors ${isSelected ? 'text-accent' : 'text-neon-cyan'}`}>
                      {option.icon}
                    </div>
                    <span className={`text-lg font-semibold ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Rating */}
          {currentQuizStep.type === 'rating' && (
            <div className="space-y-3 max-w-2xl mx-auto">
              {currentQuizStep.options.map((genre, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 border border-border/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-accent">{genre.icon}</span>
                    <span className="text-foreground font-medium">{genre.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button key={rating} className="p-1" onClick={() => {
                        const cur = answers[currentQuizStep.id] || {};
                        handleAnswerChange(currentQuizStep.id, { ...cur, [genre.label]: rating });
                      }}>
                        <Star className={`w-5 h-5 transition-colors ${
                          (answers[currentQuizStep.id]?.[genre.label] || 0) >= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/40'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Selected count for multi-select */}
      {currentQuizStep.type === 'multiple' && (
        <div className="text-center mt-4">
          <Badge variant="secondary" className="text-sm">
            {(answers[currentQuizStep.id] || []).length} selected
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10 max-w-3xl mx-auto">
        <Button variant="outline" size="lg" onClick={handlePrevious} disabled={isSubmitting}
          className="rounded-xl px-8 border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button size="lg" onClick={handleNext} disabled={isSubmitting}
          className="rounded-xl px-8 btn-gradient">
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </div>
          ) : currentStep === totalSteps - 1 ? (
            <>Complete Quiz <Check className="w-4 h-4 ml-2" /></>
          ) : (
            <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedQuiz;
