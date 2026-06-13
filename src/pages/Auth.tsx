
import { useState, useEffect } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { Film, Sparkles, Star } from "lucide-react";

const Auth = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [showFlash, setShowFlash] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === "signin"
          ? await signIn.email({ email, password })
          : await signUp.email({ email, password, name: name || email.split("@")[0] });
      if (res.error) {
        setError(res.error.message || "Authentication failed");
      }
      // On success, useSession updates and the effect below navigates home.
    } catch {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      setShowFlash(true);
      const timer = setTimeout(() => navigate("/"), 800);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#02020a] selection:bg-purple-500/30">
      <MouseGlow />

      {/* Projector flash on login */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Cinema imagery */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200"
              alt="Cinema"
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#02020a] via-[#02020a]/60 to-[#02020a]" />
          </div>

          {/* Projector beam effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-12 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                VIP Access Only
              </div>

              <h1 className="text-5xl xl:text-7xl font-black font-display tracking-tighter uppercase italic text-white leading-none mb-6">
                Welcome
                <br />
                <span className="text-purple-500">To The</span>
                <br />
                Club
              </h1>

              <p className="text-white/30 text-lg font-medium leading-relaxed">
                Your personal cinema experience awaits. Sign in to unlock
                AI-powered recommendations, curated collections, and your
                private screening room.
              </p>

              {/* Floating stats */}
              <div className="flex gap-6 mt-12">
                {[
                  { value: "50K+", label: "Films" },
                  { value: "AI", label: "Powered" },
                  { value: "∞", label: "Discovery" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-white font-mono font-black text-2xl">
                      {stat.value}
                    </div>
                    <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-3xl font-black font-display tracking-tighter uppercase italic text-white">
                VIP Access
              </h1>
              <p className="text-white/30 text-sm mt-2">Enter the cinema club</p>
            </div>

            <div className="p-6 sm:p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="hidden lg:block mb-8">
                <h2 className="text-2xl font-black font-display tracking-tighter uppercase text-white">
                  Enter Cinema
                </h2>
                <p className="text-white/30 text-sm mt-1">
                  Sign in or create your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border-b-2 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border-b-2 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border-b-2 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                >
                  {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setError(null);
                  }}
                  className="w-full text-center text-purple-400 hover:text-purple-300 text-xs font-bold"
                >
                  {mode === "signin"
                    ? "Need an account? Sign up"
                    : "Have an account? Sign in"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
