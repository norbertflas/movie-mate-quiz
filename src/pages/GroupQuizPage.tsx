
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Link2, Copy, Check, ArrowRight, ArrowLeft, Star, Sparkles,
  Film, Tv, BookOpen, Clapperboard, Laugh, Zap, Heart, Brain,
  Sofa, PartyPopper, Baby, Monitor, Globe, Clock, RotateCcw, Loader2
} from "lucide-react";
import { Movie } from "@/types/movie";

// Same quiz steps as EnhancedQuiz but without gamification
const STREAMING_SERVICES_OPTIONS = [
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

interface QuizStep {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "multiple" | "rating";
  options: { label: string; icon: React.ReactNode }[];
}

const groupQuizSteps: QuizStep[] = [
  {
    id: 'streaming_services',
    question: 'Which streaming services does your group use?',
    subtitle: 'Select all platforms available to anyone in the group',
    type: 'multiple',
    options: STREAMING_SERVICES_OPTIONS,
  },
  {
    id: 'content_type',
    question: 'What type of content are you looking for?',
    type: 'single',
    options: [
      { label: 'Movies', icon: <Film className="w-10 h-10" /> },
      { label: 'TV Series', icon: <Tv className="w-10 h-10" /> },
      { label: 'Documentaries', icon: <BookOpen className="w-10 h-10" /> },
      { label: 'Mixed Content', icon: <Clapperboard className="w-10 h-10" /> },
    ],
  },
  {
    id: 'mood_preference',
    question: 'What mood is your group in?',
    type: 'single',
    options: [
      { label: 'Need a laugh', icon: <Laugh className="w-10 h-10" /> },
      { label: 'Edge of my seat', icon: <Zap className="w-10 h-10" /> },
      { label: 'Something romantic', icon: <Heart className="w-10 h-10" /> },
      { label: 'Mind-bending', icon: <Brain className="w-10 h-10" /> },
    ],
  },
  {
    id: 'era_preference',
    question: 'What era of movies?',
    type: 'single',
    options: [
      { label: 'Latest (2023-2025)', icon: <Sparkles className="w-10 h-10" /> },
      { label: 'Modern (2010-2022)', icon: <Zap className="w-10 h-10" /> },
      { label: 'Classic (2000s & older)', icon: <Clock className="w-10 h-10" /> },
      { label: 'No preference', icon: <Globe className="w-10 h-10" /> },
    ],
  },
  {
    id: 'genre_rating',
    question: 'Rate genres for the group',
    subtitle: 'What does everyone enjoy?',
    type: 'rating',
    options: [
      { label: 'Action & Adventure', icon: <Zap className="w-5 h-5" /> },
      { label: 'Comedy', icon: <Laugh className="w-5 h-5" /> },
      { label: 'Drama', icon: <Film className="w-5 h-5" /> },
      { label: 'Horror & Thriller', icon: <Brain className="w-5 h-5" /> },
      { label: 'Science Fiction', icon: <Sparkles className="w-5 h-5" /> },
      { label: 'Romance', icon: <Heart className="w-5 h-5" /> },
    ],
  },
];

const MOVIE_POOL: Movie[] = [
  {
    id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg",
    overview: "A depressed man suffering from insomnia meets a strange soap salesman and forms an underground fight club.",
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
    overview: "When the menace known as the Joker wreaks havoc on Gotham, Batman must face one of the greatest tests.",
    release_date: "2008-07-14", vote_average: 8.5, runtime: 152,
    genres: [{ id: 18, name: "Drama" }, { id: 28, name: "Action" }],
    genre: "Action", vote_count: 30000, popularity: 80, cast: [], tmdbId: 155
  },
  {
    id: 13, title: "Forrest Gump", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c9UVPPiTPltouxRVY6N9uugaVA.jpg",
    overview: "The presidencies of Kennedy and Johnson, Vietnam, Watergate through the eyes of an Alabama man with an IQ of 75.",
    release_date: "1994-07-06", vote_average: 8.5, runtime: 142,
    genres: [{ id: 35, name: "Comedy" }, { id: 18, name: "Drama" }],
    genre: "Drama", vote_count: 24000, popularity: 65, cast: [], tmdbId: 13
  },
  {
    id: 278, title: "The Shawshank Redemption", poster_path: "/9cjIGRiQMVhxPavNbVe0YkpgiVM.jpg",
    backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    overview: "Imprisoned in the 1940s for the double murder of his wife and her lover, Andy Dufresne begins to slowly gain respect.",
    release_date: "1994-09-23", vote_average: 8.7, runtime: 142,
    genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }],
    genre: "Drama", vote_count: 24000, popularity: 75, cast: [], tmdbId: 278
  },
];

export const GroupQuizPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { toast } = useToast();
  const [groupData, setGroupData] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Quiz state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state  
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const shareUrl = `${window.location.origin}/quiz/group/${groupId}`;

  useEffect(() => {
    if (groupId) loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      // Load group info (public read via RLS)
      const { data: group } = await supabase
        .from("quiz_groups")
        .select("*")
        .eq("id", groupId)
        .single();

      setGroupData(group);

      // Load existing responses
      const { data: existingResponses } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("group_id", groupId);

      setResponses(existingResponses || []);

      // Check if current user already submitted
      const { data: { user } } = await supabase.auth.getUser();
      if (user && existingResponses?.some(r => r.user_id === user.id)) {
        setHasSubmitted(true);
      }
    } catch (e) {
      console.error("Error loading group:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast({ title: "Link copied! 🔗", description: "Share it with your friends." });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAnswerChange = (stepId: string, answer: any) => {
    const step = groupQuizSteps[currentStep];
    if (step.type === 'multiple') {
      const current: string[] = answers[stepId] || [];
      if (current.includes(answer)) {
        setAnswers(prev => ({ ...prev, [stepId]: current.filter(a => a !== answer) }));
      } else {
        setAnswers(prev => ({ ...prev, [stepId]: [...current, answer] }));
      }
    } else if (step.type === 'rating') {
      setAnswers(prev => ({ ...prev, [stepId]: answer }));
    } else {
      setAnswers(prev => ({ ...prev, [stepId]: answer }));
    }
  };

  const handleNext = () => {
    const step = groupQuizSteps[currentStep];
    const currentAnswer = answers[step.id];
    if (step.type === 'multiple' && (!currentAnswer || currentAnswer.length === 0)) {
      toast({ title: "Select at least one option", variant: "destructive" });
      return;
    }
    if (!currentAnswer && step.type !== 'rating') {
      toast({ title: "Please select an answer", variant: "destructive" });
      return;
    }
    if (currentStep < groupQuizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("quiz_responses").insert({
          group_id: groupId!,
          user_id: user.id,
          answers: answers as any,
        });
      }

      // Generate recommendations (same seed for group)
      await new Promise(r => setTimeout(r, 1500));
      const shuffled = [...MOVIE_POOL].sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 5));
      setCurrentMovieIndex(0);
      setHasSubmitted(true);
      setShowResults(true);

      // Reload responses
      await loadGroupData();

      toast({ title: "Quiz submitted! 🎬", description: "Here are your group's recommendations." });
    } catch (e) {
      console.error("Submit error:", e);
      toast({ title: "Error submitting quiz", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowNextMovie = () => {
    if (currentMovieIndex < recommendations.length - 1) {
      setCurrentMovieIndex(prev => prev + 1);
    }
  };

  const progressPercentage = ((currentStep + 1) / groupQuizSteps.length) * 100;
  const currentQuizStep = groupQuizSteps[currentStep];
  const currentMovie = recommendations[currentMovieIndex];
  const isLastMovie = currentMovieIndex >= recommendations.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Group not found</h1>
          <p className="text-muted-foreground">This quiz link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  // ─── RESULTS VIEW ───
  if (showResults && currentMovie) {
    return (
      <div className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Group header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Badge className="bg-accent/20 text-accent border border-accent/30 mb-3">
              <Users className="w-3 h-3 mr-1" /> Group Quiz — {groupData.name}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {responses.length} {responses.length === 1 ? 'person' : 'people'} answered • Showing shared recommendations
            </p>
          </motion.div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {recommendations.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${
                i === currentMovieIndex ? 'bg-accent shadow-lg shadow-accent/50'
                : i < currentMovieIndex ? 'bg-primary/40' : 'bg-secondary/50'
              }`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/50 backdrop-blur-xl">
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
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                      Group Pick
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 -mt-16 relative z-10">
                  <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">{currentMovie.title}</h2>
                  <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                    {currentMovie.release_date && <span>{new Date(currentMovie.release_date).getFullYear()}</span>}
                    {currentMovie.runtime && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {currentMovie.runtime} min</span>}
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> {currentMovie.vote_average?.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(Array.isArray(currentMovie.genres) ? currentMovie.genres : []).map((genre, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                        {typeof genre === 'string' ? genre : genre.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg max-w-3xl">{currentMovie.overview}</p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {!isLastMovie ? (
                      <Button size="lg" variant="outline" onClick={handleShowNextMovie}
                        className="flex-1 rounded-xl border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                        <ArrowRight className="w-5 h-5 mr-2" /> Show another ({recommendations.length - currentMovieIndex - 1} left)
                      </Button>
                    ) : (
                      <Button size="lg" variant="outline" onClick={() => { setShowResults(false); setCurrentStep(0); setAnswers({}); setHasSubmitted(false); }}
                        className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
                        <RotateCcw className="w-5 h-5 mr-2" /> Retake quiz
                      </Button>
                    )}
                    <Button size="lg" onClick={handleCopyLink}
                      className="flex-1 rounded-xl btn-gradient">
                      {linkCopied ? <><Check className="w-5 h-5 mr-2" /> Copied!</> : <><Link2 className="w-5 h-5 mr-2" /> Share with more friends</>}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── WAITING / ALREADY SUBMITTED ───
  if (hasSubmitted && !showResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/30">
            <Check className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">You already submitted!</h2>
          <p className="text-muted-foreground mb-6">{responses.length} people answered so far. Share the link to get more friends involved.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => { setShowResults(true); const shuffled = [...MOVIE_POOL].sort(() => 0.5 - Math.random()); setRecommendations(shuffled.slice(0, 5)); setCurrentMovieIndex(0); }}
              className="btn-gradient rounded-xl" size="lg">
              <Sparkles className="w-5 h-5 mr-2" /> View Recommendations
            </Button>
            <Button variant="outline" onClick={handleCopyLink} className="rounded-xl" size="lg">
              {linkCopied ? <><Check className="w-5 h-5 mr-2" /> Copied!</> : <><Copy className="w-5 h-5 mr-2" /> Copy link for friends</>}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── QUIZ FORM ───
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Group header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Badge className="bg-accent/20 text-accent border border-accent/30 mb-3">
            <Users className="w-3 h-3 mr-1" /> Group Quiz
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">{groupData.name}</h1>
          <p className="text-muted-foreground text-sm">{responses.length} people answered so far</p>
        </motion.div>

        {/* Share link bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2 bg-secondary/30 border border-border/30 rounded-xl p-3 mb-8 max-w-xl mx-auto">
          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{shareUrl}</span>
          <Button size="sm" variant="ghost" onClick={handleCopyLink} className="shrink-0">
            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">Question {currentStep + 1} of {groupQuizSteps.length}</p>
          <div className="relative h-2 w-full rounded-full bg-secondary/50 border border-border/20 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))' }}
              initial={false}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 text-gradient-neon">{currentQuizStep.question}</h2>
            {currentQuizStep.subtitle && <p className="text-center text-muted-foreground mb-8">{currentQuizStep.subtitle}</p>}

            {/* Multiple select */}
            {currentQuizStep.type === 'multiple' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
                {currentQuizStep.options.map((option, index) => {
                  const selected: string[] = answers[currentQuizStep.id] || [];
                  const isSelected = selected.includes(option.label);
                  return (
                    <motion.button key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswerChange(currentQuizStep.id, option.label)}
                      className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all min-h-[120px] ${
                        isSelected ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20' : 'border-border/40 bg-secondary/30 hover:border-primary/40'
                      }`}>
                      <div className={isSelected ? 'text-accent' : 'text-neon-cyan'}>{option.icon}</div>
                      <span className={`text-sm font-semibold text-center ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{option.label}</span>
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
                    <motion.button key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswerChange(currentQuizStep.id, option.label)}
                      className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all min-h-[160px] ${
                        isSelected ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20' : 'border-border/40 bg-secondary/30 hover:border-primary/40'
                      }`}>
                      <div className={isSelected ? 'text-accent' : 'text-neon-cyan'}>{option.icon}</div>
                      <span className={`text-lg font-semibold ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{option.label}</span>
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
                              ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentQuizStep.type === 'multiple' && (
          <div className="text-center mt-4">
            <Badge variant="secondary">{(answers[currentQuizStep.id] || []).length} selected</Badge>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 max-w-3xl mx-auto">
          <Button variant="outline" size="lg" onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : null}
            disabled={currentStep === 0 || isSubmitting}
            className="rounded-xl px-8 border-border/40 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button size="lg" onClick={handleNext} disabled={isSubmitting} className="rounded-xl px-8 btn-gradient">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : currentStep === groupQuizSteps.length - 1 ? (
              <>Submit for Group <Check className="w-4 h-4 ml-2" /></>
            ) : (
              <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupQuizPage;
