
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-48 pb-32 px-8 text-center max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-8">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          AI-Powered Recommendations
        </div>

        <h1 className="text-7xl md:text-8xl font-black mb-8 tracking-tight leading-[0.9] font-display">
          Find Your Next <br />
          <span className="text-gradient-hero">Obsession</span>
        </h1>

        <p className="text-white/40 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Stop scrolling and start watching. Get personalized movie and series
          recommendations based on your unique taste and mood.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button
            onClick={() => navigate("/quiz")}
            className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-xl text-white shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all overflow-hidden active:scale-95"
            style={{ boxShadow: "0 8px 30px rgba(147, 51, 234, 0.3)" }}
          >
            <div className="relative z-10 flex items-center gap-3">
              Start the Quiz{" "}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate("/search")}
            className="px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl font-bold text-xl text-white hover:bg-white/10 transition-all flex items-center gap-3"
          >
            <Play className="w-6 h-6 fill-white" /> Browse Popular
          </button>
        </div>
      </motion.div>
    </section>
  );
};
