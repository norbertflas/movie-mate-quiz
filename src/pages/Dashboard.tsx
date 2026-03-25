
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Film, Clock, Trophy, User, Settings, Sparkles,
  Heart, Eye, Star, LogOut, Moon, Volume2, VolumeX,
  ChevronRight, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { session } = useAuth();
  const user = session?.user;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ saved: 0, watched: 0, quizzes: 0 });
  const [recentFavorites, setRecentFavorites] = useState<any[]>([]);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [savedRes, watchedRes, quizRes] = await Promise.all([
        supabase.from("saved_movies").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("watched_movies").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("quiz_history").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);

      setStats({
        saved: savedRes.count || 0,
        watched: watchedRes.count || 0,
        quizzes: quizRes.count || 0,
      });

      // Fetch recent favorites for activity feed
      const { data: recent } = await supabase
        .from("saved_movies")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentFavorites(recent || []);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({ title: "Signed out successfully" });
  };

  const estimatedHours = Math.round(stats.watched * 2);

  if (!user) return null;

  const userEmail = user.email || "";
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split("@")[0];
  const userAvatar = user.user_metadata?.avatar_url;

  // Rank based on activity
  const getRank = () => {
    const total = stats.saved + stats.watched;
    if (total >= 50) return "Executive Producer";
    if (total >= 20) return "Lead Critic";
    if (total >= 10) return "Film Enthusiast";
    if (total >= 5) return "Cinephile Novice";
    return "Fresh Viewer";
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#02020a] selection:bg-purple-500/30">
      <MouseGlow />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0 overflow-hidden">
        <div
          className="absolute inset-[-200%] animate-grain"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />
      </div>

      <div className="relative z-10">
        <Navigation />

        <div className="pt-24 sm:pt-32 pb-16 px-3 sm:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 sm:mb-16"
          >
            <span className="text-purple-500 font-black uppercase tracking-[0.3em] text-[10px] block mb-2">
              Director's Suite
            </span>
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tighter uppercase italic text-white leading-none">
              Your Dashboard
            </h1>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Profile Card - Large */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 lg:col-span-1 lg:row-span-2 p-6 sm:p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl flex flex-col items-center text-center"
            >
              {/* Avatar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/10 mb-6 group">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                    style={{ filter: cinemaMode ? "grayscale(1) contrast(1.2)" : undefined }}
                  />
                ) : (
                  <div className="w-full h-full bg-purple-600/20 flex items-center justify-center">
                    <User className="w-12 h-12 text-purple-400" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black font-display tracking-tighter text-white mb-1">
                {userName}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-[0.15em] mb-4">
                <Trophy className="w-3 h-3" />
                {getRank()}
              </div>
              <p className="text-white/20 text-xs font-medium">{userEmail}</p>

              <div className="w-full mt-auto pt-8">
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold text-xs uppercase tracking-widest hover:bg-red-600/20 hover:border-red-500/30 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 inline mr-2" />
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            {[
              { icon: <Heart className="w-6 h-6 text-red-400" />, value: stats.saved, label: "Movies Saved", color: "red" },
              { icon: <Eye className="w-6 h-6 text-blue-400" />, value: stats.watched, label: "Movies Watched", color: "blue" },
              { icon: <Clock className="w-6 h-6 text-green-400" />, value: `${estimatedHours}h`, label: "Hours of Cinema", color: "green" },
              { icon: <Sparkles className="w-6 h-6 text-yellow-400" />, value: stats.quizzes, label: "AI Personas", color: "yellow" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="p-6 sm:p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-white/5">{stat.icon}</div>
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}

            {/* Settings Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 sm:p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-white/40" />
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">
                  Settings
                </h3>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setCinemaMode(!cinemaMode)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    cinemaMode
                      ? "bg-purple-600/20 border-purple-500/30 text-purple-300"
                      : "bg-white/[0.02] border-white/5 text-white/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Cinema Mode</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-all ${cinemaMode ? "bg-purple-600" : "bg-white/10"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform ${cinemaMode ? "translate-x-[18px]" : "translate-x-0.5"} mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setAudioFeedback(!audioFeedback)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    audioFeedback
                      ? "bg-purple-600/20 border-purple-500/30 text-purple-300"
                      : "bg-white/[0.02] border-white/5 text-white/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase tracking-widest">Audio Feedback</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-all ${audioFeedback ? "bg-purple-600" : "bg-white/10"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform ${audioFeedback ? "translate-x-[18px]" : "translate-x-0.5"} mt-0.5`} />
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2 lg:col-span-2 p-6 sm:p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">
                  Recent Activity
                </h3>
                <button
                  onClick={() => navigate("/favorites")}
                  className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-purple-300 transition-colors"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentFavorites.length > 0 ? (
                <div className="space-y-3">
                  {recentFavorites.map((movie, idx) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        {idx < recentFavorites.length - 1 && (
                          <div className="w-px h-8 bg-white/5 mt-1" />
                        )}
                      </div>

                      {/* Poster */}
                      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                        <img
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                              : "/placeholder.svg"
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {movie.title}
                        </div>
                        <div className="text-[10px] text-white/20 font-medium">
                          Added to collection
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-white/10 text-[10px] font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(movie.created_at).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Film className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-white/20 text-sm font-bold">No activity yet</p>
                  <p className="text-white/10 text-xs mt-1">Start adding movies to your collection</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
