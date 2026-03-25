
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Smile, Brain, Ghost, Rocket, Heart, Laugh, Skull, Sword,
  Search as SearchIcon, Sparkles, ChevronLeft, ChevronRight, X,
  Star, Trophy, Clapperboard, Check
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { FilmGrain } from "@/components/effects/FilmGrain";
import { ProjectorBeam } from "@/components/effects/ProjectorBeam";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { Footer } from "@/components/Footer";

const playClick = () => {
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

const playMagic = () => {
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

const Particles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(40)].map((_, i) => (
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

export const ComprehensiveQuizPage = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({
    1: "",
    2: [] as string[],
    3: "",
  });

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
          setShowResult(true);
          playMagic();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [countdown]);

  // Match percentage animation
  useEffect(() => {
    const target = step === 1 ? 33 : step === 2 ? 66 : 100;
    const timer = setInterval(() => {
      setMatchPercentage((prev) => {
        if (prev < target) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [step]);

  const handleSelect = (answer: any) => {
    if (step === 2) {
      const current = answers[2] as string[];
      const updated = current.includes(answer)
        ? current.filter((a: string) => a !== answer)
        : [...current, answer];
      setAnswers((prev) => ({ ...prev, 2: updated }));
    } else {
      setAnswers((prev) => ({ ...prev, [step]: answer }));
    }
  };

  const nextStep = () => {
    playClick();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Start generating
      setIsGenerating(true);
      playMagic();
      setTimeout(() => {
        setIsGenerating(false);
        setCountdown(3);
      }, 3000);
    }
  };

  const prevStep = () => {
    playClick();
    if (step > 1) setStep(step - 1);
  };

  const resetQuiz = () => {
    setStep(1);
    setIsGenerating(false);
    setShowResult(false);
    setCountdown(null);
    setAnswers({ 1: "", 2: [], 3: "" });
    setMatchPercentage(0);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#02020a] selection:bg-purple-500/30">
      <MouseGlow />
      <Navigation />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-[#02020a] rounded-[3rem] p-8 sm:p-12 overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.2)] border border-white/10 min-h-[70vh]">
            {/* Film grain & projector beam */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 overflow-hidden">
              <div
                className="absolute inset-[-200%] animate-grain"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
              />
            </div>
            <ProjectorBeam />
            {isGenerating && <Particles />}

            <AnimatePresence mode="wait">
              {/* GENERATING STATE */}
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-32 relative z-10"
                >
                  <div className="relative w-40 h-40 mx-auto mb-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 border-2 border-dashed border-blue-500/20 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-purple-600/20 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                        <Clapperboard className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-purple-500/40 to-transparent origin-left"
                        style={{ transform: `rotate(${i * 45}deg) translateX(40px)` }}
                      />
                    ))}
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black mb-6 font-display tracking-tighter uppercase italic text-white">
                    Developing Your Film...
                  </h2>
                  <div className="flex items-center justify-center gap-3 text-purple-400 font-bold tracking-widest uppercase text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    AI is scanning the cinematic multiverse
                  </div>
                </motion.div>

              ) : countdown !== null ? (
                /* COUNTDOWN STATE */
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 2 }}
                  className="text-center py-40 relative z-10"
                >
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="text-[10rem] sm:text-[12rem] font-black font-display text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  >
                    {countdown === 0 ? "ACTION!" : countdown}
                  </motion.div>
                  <div className="mt-8 text-purple-500 font-black uppercase tracking-[0.5em] text-xl">
                    Get Ready
                  </div>
                </motion.div>

              ) : showResult ? (
                /* RESULT STATE */
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-16 relative z-10"
                >
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
                    <h2 className="text-5xl sm:text-7xl font-black font-display tracking-tighter italic uppercase text-white">
                      The Cosmic Dreamer
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                      You're drawn to mind-bending narratives and visual spectacles that blur the line between reality and imagination.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Movie poster */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600"
                        alt="Premiere Pick"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-transparent to-transparent opacity-60" />
                      <div className="absolute top-6 left-6">
                        <div className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-xs font-black uppercase tracking-widest shadow-lg">
                          Premiere Pick
                        </div>
                      </div>
                      {/* Spotlight effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
                      </div>
                    </motion.div>

                    {/* Movie details */}
                    <div className="space-y-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white/40 text-xs font-bold">
                            2014
                          </span>
                          <span className="px-3 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            8.7
                          </span>
                          <span className="text-purple-400 text-xs font-black uppercase tracking-widest">
                            Sci-Fi
                          </span>
                        </div>
                        <h3 className="text-5xl sm:text-6xl font-black font-display tracking-tighter leading-none text-white">
                          Interstellar
                        </h3>
                        <p className="text-xl text-white/40 leading-relaxed font-medium italic">
                          "A cosmic journey that matches your love for mind-bending {answers[2]?.[0] || 'Sci-Fi'} narratives."
                        </p>
                      </div>

                      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-purple-400 font-black uppercase tracking-widest text-xs">
                          <Sparkles className="w-4 h-4" />
                          Why you'll love it
                        </div>
                        <p className="text-white/60 leading-relaxed">
                          Based on your {answers[1] || 'adventurous'} mood and interest in{" "}
                          {(answers[2] as string[])?.join(" & ") || 'epic stories'}, this film
                          combines breathtaking visuals with an emotionally gripping narrative
                          about love, sacrifice, and the mysteries of the universe.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4">
                        <button
                          onClick={resetQuiz}
                          className="h-16 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all active:scale-95"
                        >
                          New Screening
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

              ) : (
                /* QUIZ STEPS */
                <>
                  {/* Header with progress */}
                  <div className="mb-20 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-6">
                        {step > 1 && (
                          <button
                            onClick={prevStep}
                            className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                          >
                            <ChevronLeft className="w-6 h-6 text-white/40" />
                          </button>
                        )}
                        <div>
                          <span className="text-purple-500 font-black uppercase tracking-[0.3em] text-[10px] block mb-1">
                            Production Phase
                          </span>
                          <span className="text-white font-black uppercase tracking-widest text-xl font-display">
                            Scene {step} of 3
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] block mb-1">
                          Projection Quality
                        </span>
                        <span className="text-white font-display font-black text-2xl italic tracking-tighter">
                          {matchPercentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Step content */}
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12 relative z-10"
                      >
                        <div className="space-y-4">
                          <h3 className="text-4xl sm:text-5xl font-black font-display tracking-tighter uppercase italic text-white">
                            What's the vibe for tonight's screening?
                          </h3>
                          <p className="text-white/30 text-lg font-medium">
                            Select the emotional frequency of your next cinematic journey.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {[
                            { id: "Excited & Adventurous", label: "Excited & Adventurous", icon: <Zap className="w-8 h-8 text-yellow-400" />, desc: "Ready for a wild ride" },
                            { id: "Relaxed & Chill", label: "Relaxed & Chill", icon: <Smile className="w-8 h-8 text-green-400" />, desc: "Something easy-going" },
                            { id: "Deep & Thoughtful", label: "Deep & Thoughtful", icon: <Brain className="w-8 h-8 text-blue-400" />, desc: "Make me think" },
                            { id: "Scared & Thrilled", label: "Scared & Thrilled", icon: <Ghost className="w-8 h-8 text-purple-400" />, desc: "Heart-pounding action" },
                          ].map((mood) => (
                            <button
                              key={mood.id}
                              onClick={() => {
                                playClick();
                                handleSelect(mood.id);
                                nextStep();
                              }}
                              className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 relative overflow-hidden ${
                                answers[1] === mood.id
                                  ? "bg-purple-600 border-purple-400 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
                              }`}
                            >
                              <div className={`mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${answers[1] === mood.id ? "text-white" : "text-purple-500"}`}>
                                {mood.icon}
                              </div>
                              <div className="relative z-10">
                                <div className={`text-2xl font-black uppercase tracking-tight mb-2 ${answers[1] === mood.id ? "text-white" : "text-white/90"}`}>
                                  {mood.label}
                                </div>
                                <p className={`text-sm font-medium leading-relaxed ${answers[1] === mood.id ? "text-white/70" : "text-white/30"}`}>
                                  {mood.desc}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12 relative z-10"
                      >
                        <div className="space-y-4">
                          <h3 className="text-4xl sm:text-5xl font-black font-display tracking-tighter uppercase italic text-white">
                            Pick your genres
                          </h3>
                          <p className="text-white/30 text-lg font-medium">
                            Choose the flavors that will define this production.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          {[
                            { label: "Sci-Fi", icon: <Rocket className="w-6 h-6" /> },
                            { label: "Drama", icon: <Heart className="w-6 h-6" /> },
                            { label: "Comedy", icon: <Laugh className="w-6 h-6" /> },
                            { label: "Horror", icon: <Skull className="w-6 h-6" /> },
                            { label: "Action", icon: <Sword className="w-6 h-6" /> },
                            { label: "Mystery", icon: <SearchIcon className="w-6 h-6" /> },
                          ].map((genre) => (
                            <button
                              key={genre.label}
                              onClick={() => {
                                playClick();
                                handleSelect(genre.label);
                              }}
                              className={`group p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-6 ${
                                (answers[2] as string[]).includes(genre.label)
                                  ? "bg-purple-600 border-purple-400 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
                              }`}
                            >
                              <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 ${
                                (answers[2] as string[]).includes(genre.label) ? "bg-white/20 text-white" : "bg-white/5 text-purple-500"
                              }`}>
                                {genre.icon}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-black uppercase tracking-widest text-sm ${
                                  (answers[2] as string[]).includes(genre.label) ? "text-white" : "text-white/60"
                                }`}>
                                  {genre.label}
                                </span>
                                {(answers[2] as string[]).includes(genre.label) && (
                                  <Sparkles className="w-4 h-4 text-yellow-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-center pt-8">
                          <button
                            onClick={nextStep}
                            disabled={(answers[2] as string[]).length === 0}
                            className="px-12 h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-purple-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95"
                          >
                            Next Scene
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12 relative z-10"
                      >
                        <div className="space-y-4">
                          <h3 className="text-4xl sm:text-5xl font-black font-display tracking-tighter uppercase italic text-white">
                            Select an era
                          </h3>
                          <p className="text-white/30 text-lg font-medium">
                            When should this cinematic journey take place?
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {[
                            { label: "Modern Masterpieces", desc: "2010 to Present Day", icon: "✨" },
                            { label: "The Classics", desc: "Pre-2000 Golden Age", icon: "🎞️" },
                            { label: "Hidden Gems", desc: "Underrated Indie Hits", icon: "💎" },
                            { label: "Surprise Me!", desc: "AI Random Selection", icon: "🎲" },
                          ].map((era) => (
                            <button
                              key={era.label}
                              onClick={() => {
                                playClick();
                                handleSelect(era.label);
                                nextStep();
                              }}
                              className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 relative overflow-hidden ${
                                answers[3] === era.label
                                  ? "bg-purple-600 border-purple-400 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
                              }`}
                            >
                              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 block">
                                {era.icon}
                              </div>
                              <div className="relative z-10">
                                <div className={`text-2xl font-black uppercase tracking-tight mb-2 ${answers[3] === era.label ? "text-white" : "text-white/90"}`}>
                                  {era.label}
                                </div>
                                <p className={`text-sm font-medium leading-relaxed ${answers[3] === era.label ? "text-white/70" : "text-white/30"}`}>
                                  {era.desc}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom nav */}
                  <div className="mt-20 flex items-center justify-between border-t border-white/5 pt-10 relative z-10">
                    <button className="text-white/30 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">
                      Skip Production
                    </button>
                    <div className="flex gap-6">
                      {step > 1 && (
                        <button
                          onClick={prevStep}
                          className="px-8 h-14 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                        >
                          Previous Scene
                        </button>
                      )}
                      <button
                        onClick={nextStep}
                        disabled={step === 2 && (answers[2] as string[]).length === 0}
                        className={`flex items-center gap-3 px-10 h-14 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                          step === 2 && (answers[2] as string[]).length === 0
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 active:scale-95"
                        }`}
                      >
                        {step === 3 ? "Final Cut" : "Next Scene"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
