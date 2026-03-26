
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Check, Sparkles, Users, 
  Trophy, Star, Laugh, Zap, Heart, Brain, Film, Tv, BookOpen, Clapperboard,
  Sofa, PartyPopper, Baby, Monitor, RotateCcw,
  Clock, Globe, ChevronLeft, ChevronRight, Loader2,
  Rocket, Skull, Sword, Search as SearchIcon, Ghost, Smile
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/types/movie";
import { ProjectorBeam } from "@/components/effects/ProjectorBeam";

interface EnhancedQuizProps {
  onBack?: () => void;
  onComplete?: (results: any) => void;
  userPreferences?: any;
}

interface QuizStep {
  id: string;
  title: string;
  subtitle?: string;
  type: "single" | "multiple" | "rating";
  options: { label: string; icon: React.ReactNode; desc?: string }[];
  sceneName: string;
}

const playClick = () => {
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
  audio.volume = 0.15;
  audio.play().catch(() => {});
};

const playMagic = () => {
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

const Particles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        initial={{
          x: Math.random() * 1200,
          y: Math.random() * 1000,
          opacity: 0,
          scale: Math.random() * 0.3 + 0.1,
        }}
        animate={{
          y: [null, Math.random() * -600 - 200],
          opacity: [0, 0.4, 0],
          x: [null, (Math.random() - 0.5) * 100 + Math.random() * 1200],
        }}
        transition={{
          duration: Math.random() * 5 + 5,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5,
        }}
        className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
      />
    ))}
  </div>
);

const STREAMING_SERVICES = [
  { label: 'Netflix', icon: <Film className="w-6 h-6" />, desc: 'Movies & Series' },
  { label: 'HBO Max', icon: <Tv className="w-6 h-6" />, desc: 'Premium Content' },
  { label: 'Disney+', icon: <Sparkles className="w-6 h-6" />, desc: 'Family & Marvel' },
  { label: 'Amazon Prime', icon: <Star className="w-6 h-6" />, desc: 'Wide Selection' },
  { label: 'Apple TV+', icon: <Monitor className="w-6 h-6" />, desc: 'Original Series' },
  { label: 'Hulu', icon: <Zap className="w-6 h-6" />, desc: 'TV & Streaming' },
  { label: 'Paramount+', icon: <Clapperboard className="w-6 h-6" />, desc: 'Blockbusters' },
  { label: 'Canal+', icon: <Film className="w-6 h-6" />, desc: 'European Cinema' },
  { label: 'SkyShowtime', icon: <Globe className="w-6 h-6" />, desc: 'Sky Originals' },
  { label: 'Player', icon: <Monitor className="w-6 h-6" />, desc: 'Polish Content' },
];

const quizSteps: QuizStep[] = [
  {
    id: 'streaming_services',
    title: 'What\'s in your cinema toolkit?',
    subtitle: 'Select all streaming services you have — we\'ll find films on your platforms.',
    type: 'multiple',
    options: STREAMING_SERVICES,
    sceneName: 'The Setup',
  },
  {
    id: 'content_type',
    title: 'What format speaks to you?',
    subtitle: 'Choose the type of content for tonight\'s session.',
    type: 'single',
    options: [
      { label: 'Movies', icon: <Film className="w-8 h-8" />, desc: 'Feature-length stories' },
      { label: 'TV Series', icon: <Tv className="w-8 h-8" />, desc: 'Episodic adventures' },
      { label: 'Documentaries', icon: <BookOpen className="w-8 h-8" />, desc: 'Real-world narratives' },
      { label: 'Mixed Content', icon: <Clapperboard className="w-8 h-8" />, desc: 'Surprise me with anything' },
    ],
    sceneName: 'The Format',
  },
  {
    id: 'mood_preference',
    title: 'What\'s the vibe for tonight\'s screening?',
    subtitle: 'Select the emotional frequency of your next cinematic journey.',
    type: 'single',
    options: [
      { label: 'Need a laugh', icon: <Laugh className="w-8 h-8 text-yellow-400" />, desc: 'Comedy & light-hearted fun' },
      { label: 'Edge of my seat', icon: <Zap className="w-8 h-8 text-orange-400" />, desc: 'Thrilling & suspenseful' },
      { label: 'Something romantic', icon: <Heart className="w-8 h-8 text-pink-400" />, desc: 'Love stories & drama' },
      { label: 'Mind-bending', icon: <Brain className="w-8 h-8 text-blue-400" />, desc: 'Deep & thought-provoking' },
    ],
    sceneName: 'The Vibe',
  },
  {
    id: 'era_preference',
    title: 'Select an era',
    subtitle: 'When should this cinematic journey take place?',
    type: 'single',
    options: [
      { label: 'Latest (2023-2025)', icon: <Sparkles className="w-8 h-8" />, desc: 'Fresh off the reel' },
      { label: 'Modern (2010-2022)', icon: <Zap className="w-8 h-8" />, desc: 'Contemporary classics' },
      { label: 'Classic (2000s & older)', icon: <Clock className="w-8 h-8" />, desc: 'Timeless masterpieces' },
      { label: 'Surprise Me!', icon: <Globe className="w-8 h-8" />, desc: 'AI Random Selection' },
    ],
    sceneName: 'The Era',
  },
  {
    id: 'social_watching',
    title: 'Who\'s in the audience?',
    subtitle: 'Tell us about tonight\'s screening crew.',
    type: 'single',
    options: [
      { label: 'Solo binge', icon: <Sofa className="w-8 h-8" />, desc: 'Just me, myself & cinema' },
      { label: 'Movie night with friends', icon: <PartyPopper className="w-8 h-8" />, desc: 'Group entertainment' },
      { label: 'Family time', icon: <Baby className="w-8 h-8" />, desc: 'All ages welcome' },
      { label: 'Online watch party', icon: <Monitor className="w-8 h-8" />, desc: 'Virtual cinema' },
    ],
    sceneName: 'The Audience',
  },
  {
    id: 'genre_rating',
    title: 'Rate your genre preferences',
    subtitle: 'Star the genres you love most — this powers our AI matching.',
    type: 'rating',
    options: [
      { label: 'Action & Adventure', icon: <Sword className="w-5 h-5" /> },
      { label: 'Comedy', icon: <Laugh className="w-5 h-5" /> },
      { label: 'Drama', icon: <Heart className="w-5 h-5" /> },
      { label: 'Horror & Thriller', icon: <Skull className="w-5 h-5" /> },
      { label: 'Science Fiction', icon: <Rocket className="w-5 h-5" /> },
      { label: 'Romance', icon: <Heart className="w-5 h-5" /> },
      { label: 'Documentary', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Animation', icon: <Clapperboard className="w-5 h-5" /> },
    ],
    sceneName: 'The Taste',
  },
  {
    id: 'movie_length',
    title: 'How long is tonight\'s feature?',
    subtitle: 'Pick the runtime that fits your schedule.',
    type: 'single',
    options: [
      { label: 'Short (< 90 min)', icon: <Clock className="w-8 h-8" />, desc: 'Quick & punchy' },
      { label: 'Standard (90-120 min)', icon: <Film className="w-8 h-8" />, desc: 'Classic runtime' },
      { label: 'Long (2h+)', icon: <Clapperboard className="w-8 h-8" />, desc: 'Epic experience' },
      { label: 'No preference', icon: <Globe className="w-8 h-8" />, desc: 'Time is no object' },
    ],
    sceneName: 'The Runtime',
  },
];

// Sample movie pool
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

const AI_PERSONAS = [
  { name: "The Cosmic Dreamer", desc: "You're drawn to mind-bending narratives and visual spectacles that blur the line between reality and imagination." },
  { name: "The Night Owl", desc: "You crave dark, atmospheric stories that keep you glued to the screen long after midnight." },
  { name: "The Romantic Realist", desc: "You appreciate stories grounded in human connection, love, and raw emotional honesty." },
  { name: "The Adrenaline Junkie", desc: "Your pulse quickens at high-speed chases, epic battles, and jaw-dropping stunts." },
  { name: "The Silent Observer", desc: "You prefer slow-burn storytelling, appreciating every frame like a painting in a gallery." },
];

const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({ onBack, onComplete, userPreferences = {} }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [likedMovie, setLikedMovie] = useState<Movie | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [persona, setPersona] = useState(AI_PERSONAS[0]);

  const currentQuizStep = quizSteps[currentStep];
  const totalSteps = quizSteps.length;

  // Match percentage animation
  useEffect(() => {
    const target = Math.round(((currentStep + 1) / totalSteps) * 100);
    const timer = setInterval(() => {
      setMatchPercentage(prev => {
        if (prev < target) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 15);
    return () => clearInterval(timer);
  }, [currentStep, totalSteps]);

  // Countdown logic
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          playClick();
          setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setCountdown(null);
          setShowResults(true);
          playMagic();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [countdown]);

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
    playClick();
    if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handlePrevious = () => {
    playClick();
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
    else onBack?.();
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    playMagic();
    setTimeout(() => {
      const shuffled = [...MOVIE_POOL].sort(() => Math.random() - 0.5);
      setRecommendations(shuffled.slice(0, 5));
      setCurrentMovieIndex(0);
      setLikedMovie(null);
      setPersona(AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)]);
      setIsGenerating(false);
      setCountdown(3);
      onComplete?.({ answers, recommendations: shuffled.slice(0, 5) });
    }, 3000);
  };

  const handleShowNextMovie = () => {
    playClick();
    if (currentMovieIndex < recommendations.length - 1) {
      setCurrentMovieIndex(prev => prev + 1);
    }
  };

  const handleLikeMovie = (movie: Movie) => {
    setLikedMovie(movie);
    playMagic();
    toast({ title: `❤️ ${movie.title} added!`, description: "Great choice! You can find it in your favorites." });
  };

  const handleRetakeQuiz = () => {
    playClick();
    setShowResults(false);
    setIsGenerating(false);
    setCountdown(null);
    setCurrentStep(0);
    setAnswers({});
    setRecommendations([]);
    setCurrentMovieIndex(0);
    setLikedMovie(null);
    setMatchPercentage(0);
  };

  const handleCreateGroupQuiz = async () => {
    setIsCreatingGroup(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Log in first", description: "You need an account to create a group quiz.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      const { data: group, error } = await supabase
        .from("quiz_groups")
        .insert({ name: `Movie Night ${new Date().toLocaleDateString()}`, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from("quiz_responses").insert({
        group_id: group.id,
        user_id: user.id,
        answers: answers as any,
      });

      const shareUrl = `${window.location.origin}/quiz/group/${group.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Group quiz created! 🔗", description: "Link copied to clipboard — share it with friends!" });
      navigate(`/quiz/group/${group.id}`);
    } catch (e) {
      console.error("Error creating group quiz:", e);
      toast({ title: "Could not create group", variant: "destructive" });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const currentMovie = recommendations[currentMovieIndex];
  const isLastMovie = currentMovieIndex >= recommendations.length - 1;
  const moviesRemaining = recommendations.length - currentMovieIndex - 1;
  const matchScore = Math.floor(Math.random() * 15) + 85;

  // ─── WRAPPER ───
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-8">
      <div className="relative rounded-2xl sm:rounded-[3rem] p-4 sm:p-12 overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.15)] border border-white/10 min-h-[60vh]"
        style={{ background: 'hsl(var(--background))' }}>
        {/* Film grain overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 overflow-hidden">
          <div className="absolute inset-[-200%] animate-grain"
            style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
          />
        </div>
        <ProjectorBeam />
        {isGenerating && <Particles />}

        <AnimatePresence mode="wait">
          {/* ─── GENERATING STATE ─── */}
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 sm:py-32 relative z-10"
            >
              <div className="relative w-28 h-28 sm:w-40 sm:h-40 mx-auto mb-8 sm:mb-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border-2 border-dashed border-neon-cyan/20 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                    <Clapperboard className="w-10 h-10 text-foreground" />
                  </div>
                </div>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-primary/40 to-transparent origin-left"
                    style={{ transform: `rotate(${i * 45}deg) translateX(40px)` }}
                  />
                ))}
              </div>
              <h2 className="text-2xl sm:text-5xl font-black mb-4 sm:mb-6 font-display tracking-tighter uppercase italic text-foreground">
                Developing Your Film...
              </h2>
              <div className="flex items-center justify-center gap-3 text-primary font-bold tracking-widest uppercase text-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                AI is scanning the cinematic multiverse
              </div>
            </motion.div>

          ) : countdown !== null ? (
            /* ─── COUNTDOWN STATE ─── */
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 2 }}
              className="text-center py-20 sm:py-40 relative z-10"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="text-[6rem] sm:text-[10rem] md:text-[12rem] font-black font-display text-foreground leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                {countdown === 0 ? "ACTION!" : countdown}
              </motion.div>
              <div className="mt-8 text-primary font-black uppercase tracking-[0.5em] text-xl">
                Get Ready
              </div>
            </motion.div>

          ) : showResults && currentMovie ? (
            /* ─── RESULTS VIEW ─── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 relative z-10"
            >
              {/* AI Persona */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm font-black uppercase tracking-[0.2em]"
                >
                  <Trophy className="w-4 h-4" />
                  Your Cinematic Persona
                </motion.div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tighter italic uppercase text-foreground">
                  {persona.name}
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
                  {persona.desc}
                </p>
              </div>

              {/* Progress dots */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-bold">
                  Recommendation {currentMovieIndex + 1} of {recommendations.length}
                </p>
                <div className="flex justify-center gap-2">
                  {recommendations.map((_, i) => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${
                      i === currentMovieIndex
                        ? 'bg-primary shadow-lg shadow-primary/50'
                        : i < currentMovieIndex
                        ? 'bg-primary/40'
                        : 'bg-secondary/50'
                    }`} />
                  ))}
                </div>
              </div>

              {/* Movie display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMovie.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                    {/* Movie poster */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
                        alt={currentMovie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                      
                      {/* Match badge */}
                      <div className="absolute top-4 left-4">
                        <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest shadow-lg">
                          {matchScore}% Match
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-foreground">{currentMovie.vote_average?.toFixed(1)}</span>
                      </div>

                      {/* Spotlight on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
                      </div>
                    </motion.div>

                    {/* Movie details */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          {currentMovie.release_date && (
                            <span className="px-3 py-1 rounded bg-secondary border border-border text-muted-foreground text-xs font-bold">
                              {new Date(currentMovie.release_date).getFullYear()}
                            </span>
                          )}
                          {currentMovie.runtime && (
                            <span className="px-3 py-1 rounded bg-secondary border border-border text-muted-foreground text-xs font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {currentMovie.runtime} min
                            </span>
                          )}
                        </div>
                        <h3 className="text-3xl sm:text-5xl font-black font-display tracking-tighter leading-none text-foreground">
                          {currentMovie.title}
                        </h3>
                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(currentMovie.genres) ? currentMovie.genres : []).map((genre, i) => (
                            <span key={i} className="text-primary text-xs font-black uppercase tracking-widest">
                              {typeof genre === 'string' ? genre : genre.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Why you'll love it */}
                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                          <Sparkles className="w-4 h-4" />
                          Why you'll love it
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                          {currentMovie.overview}
                        </p>
                      </div>

                      {/* Streaming platforms */}
                      {answers.streaming_services && answers.streaming_services.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-bold">Your platforms</p>
                          <div className="flex flex-wrap gap-2">
                            {answers.streaming_services.map((service: string) => (
                              <span key={service} className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => handleLikeMovie(currentMovie)}
                          disabled={likedMovie?.id === currentMovie.id}
                          className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
                            likedMovie?.id === currentMovie.id
                              ? 'bg-green-500/20 border border-green-500/30 text-green-400 cursor-default'
                              : 'bg-gradient-to-r from-primary to-neon-cyan text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] hover:scale-105'
                          }`}
                        >
                          {likedMovie?.id === currentMovie.id ? (
                            <><Check className="w-5 h-5" /> Added to Favorites</>
                          ) : (
                            <><Heart className="w-5 h-5" /> I love this!</>
                          )}
                        </button>

                        {!isLastMovie ? (
                          <button
                            onClick={handleShowNextMovie}
                            className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-foreground font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-5 h-5" />
                            Show another ({moviesRemaining} left)
                          </button>
                        ) : (
                          <button
                            onClick={handleRetakeQuiz}
                            className="flex-1 h-14 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive font-black uppercase tracking-widest text-sm hover:bg-destructive/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-5 h-5" />
                            Nothing fits — retake
                          </button>
                        )}
                      </div>

                      {/* Group quiz & retake */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <button
                          onClick={handleCreateGroupQuiz}
                          disabled={isCreatingGroup}
                          className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-primary font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
                        >
                          {isCreatingGroup ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                          ) : (
                            <><Users className="w-4 h-4" /> Group quiz link</>
                          )}
                        </button>
                        {!isLastMovie && (
                          <button
                            onClick={handleRetakeQuiz}
                            className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest underline underline-offset-4 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            New screening
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

          ) : (
            /* ─── QUIZ STEPS VIEW ─── */
            <div className="relative z-10">
              {/* Header with progress */}
              <div className="mb-10 sm:mb-16">
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-6">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                      >
                        <ChevronLeft className="w-6 h-6 text-muted-foreground" />
                      </button>
                    )}
                    <div>
                      <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] block mb-1">
                        Production Phase
                      </span>
                      <span className="text-foreground font-black uppercase tracking-widest text-lg sm:text-xl font-display">
                        Scene {currentStep + 1}: {currentQuizStep.sceneName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] block mb-1">
                      Projection Quality
                    </span>
                    <span className="text-foreground font-display font-black text-2xl italic tracking-tighter">
                      {matchPercentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-neon-cyan shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 sm:space-y-12"
                >
                  {/* Question */}
                  <div className="space-y-3">
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tighter uppercase italic text-foreground">
                      {currentQuizStep.title}
                    </h3>
                    {currentQuizStep.subtitle && (
                      <p className="text-muted-foreground text-base sm:text-lg font-medium">
                        {currentQuizStep.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Multiple select (streaming services) */}
                  {currentQuizStep.type === 'multiple' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {currentQuizStep.options.map((option, index) => {
                        const selected: string[] = answers[currentQuizStep.id] || [];
                        const isSelected = selected.includes(option.label);
                        return (
                          <button
                            key={index}
                            onClick={() => { playClick(); handleAnswerChange(currentQuizStep.id, option.label); }}
                            className={`group p-5 sm:p-6 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center gap-3 relative overflow-hidden ${
                              isSelected
                                ? 'bg-primary border-primary/60 shadow-[0_0_40px_hsl(var(--primary)/0.3)]'
                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className={`transition-all duration-500 group-hover:scale-110 ${
                              isSelected ? 'text-primary-foreground' : 'text-primary'
                            }`}>
                              {option.icon}
                            </div>
                            <span className={`text-xs sm:text-sm font-black uppercase tracking-tight text-center leading-tight ${
                              isSelected ? 'text-primary-foreground' : 'text-foreground/80'
                            }`}>
                              {option.label}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Single select */}
                  {currentQuizStep.type === 'single' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {currentQuizStep.options.map((option, index) => {
                        const isSelected = answers[currentQuizStep.id] === option.label;
                        return (
                          <button
                            key={index}
                            onClick={() => { playClick(); handleAnswerChange(currentQuizStep.id, option.label); }}
                            className={`group p-6 sm:p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 relative overflow-hidden ${
                              isSelected
                                ? 'bg-primary border-primary/60 shadow-[0_0_40px_hsl(var(--primary)/0.3)]'
                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className={`mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                              isSelected ? 'text-primary-foreground' : 'text-primary'
                            }`}>
                              {option.icon}
                            </div>
                            <div className={`text-xl sm:text-2xl font-black uppercase tracking-tight mb-1 ${
                              isSelected ? 'text-primary-foreground' : 'text-foreground/90'
                            }`}>
                              {option.label}
                            </div>
                            {option.desc && (
                              <p className={`text-sm font-medium ${
                                isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {option.desc}
                              </p>
                            )}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center"
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Rating */}
                  {currentQuizStep.type === 'rating' && (
                    <div className="space-y-3 max-w-2xl mx-auto">
                      {currentQuizStep.options.map((genre, index) => (
                        <div key={index} className="flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] border border-white/5 rounded-2xl transition-all hover:bg-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <span className="text-primary">{genre.icon}</span>
                            <span className="text-foreground font-bold text-sm sm:text-base">{genre.label}</span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button key={rating} className="p-1" onClick={() => {
                                playClick();
                                const cur = answers[currentQuizStep.id] || {};
                                handleAnswerChange(currentQuizStep.id, { ...cur, [genre.label]: rating });
                              }}>
                                <Star className={`w-5 h-5 transition-colors ${
                                  (answers[currentQuizStep.id]?.[genre.label] || 0) >= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-white/10 hover:text-white/30'
                                }`} />
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
                <div className="text-center mt-6">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                    {(answers[currentQuizStep.id] || []).length} selected
                  </span>
                </div>
              )}

              {/* Bottom navigation */}
              <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 sm:pt-10">
                <button
                  onClick={handleRetakeQuiz}
                  className="text-muted-foreground font-black uppercase tracking-widest text-xs hover:text-foreground transition-colors order-3 sm:order-1"
                >
                  Skip Production
                </button>
                <div className="flex gap-3 sm:gap-6 w-full sm:w-auto order-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="flex-1 sm:flex-none px-6 sm:px-8 h-12 sm:h-14 rounded-xl bg-white/5 border border-white/10 text-foreground font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95"
                    >
                      Previous Scene
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex-1 sm:flex-none px-8 sm:px-12 h-12 sm:h-14 rounded-xl btn-gradient font-black uppercase tracking-widest text-xs active:scale-95"
                  >
                    {currentStep === totalSteps - 1 ? 'Complete Quiz' : 'Next Scene'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedQuiz;
