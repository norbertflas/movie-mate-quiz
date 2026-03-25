
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { FilmGrain } from "@/components/effects/FilmGrain";
import { EnhancedMovieModal } from "@/components/movie/EnhancedMovieModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Play, Info, Trash2, Star, Sparkles, Search,
  SlidersHorizontal, Calendar, Heart, Clapperboard, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TMDBMovie } from "@/services/tmdb";
import { useToast } from "@/hooks/use-toast";

type SortMode = "recent" | "title" | "rating";

const Favorites = () => {
  const { session } = useAuth();
  const user = session?.user;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_movies")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const movieData: TMDBMovie[] =
        data?.map((movie) => ({
          id: movie.tmdb_id,
          title: movie.title,
          poster_path: movie.poster_path || null,
          overview: "",
          release_date: "",
          vote_average: 0,
          vote_count: 0,
          genre_ids: [],
          adult: false,
          backdrop_path: null,
          original_language: "",
          original_title: movie.title,
          popularity: 0,
          video: false,
        })) || [];

      setFavorites(movieData);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (tmdbId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("saved_movies")
        .delete()
        .eq("tmdb_id", tmdbId)
        .eq("user_id", user?.id);

      if (error) throw error;
      setFavorites((prev) => prev.filter((m) => m.id !== tmdbId));
      toast({ title: "Removed from collection" });
    } catch {
      toast({ title: "Error removing movie", variant: "destructive" });
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sortMode === "title") return a.title.localeCompare(b.title);
    if (sortMode === "rating") return (b.vote_average || 0) - (a.vote_average || 0);
    return 0; // recent is default order from DB
  });

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#02020a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center animate-pulse mx-auto mb-6">
            <Film className="w-10 h-10 text-white" />
          </div>
          <p className="text-white/40 font-bold">Loading your screening room...</p>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (!user || favorites.length === 0) {
    return (
      <div className="min-h-screen relative overflow-x-hidden bg-[#02020a] selection:bg-purple-500/30">
        <MouseGlow />
        <Navigation />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          {/* Film reel animation */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-dashed border-white/10 rounded-full flex items-center justify-center mb-10"
          >
            <Clapperboard className="w-12 h-12 sm:w-16 sm:h-16 text-white/20" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tighter uppercase italic text-white mb-4"
          >
            Your Screening Room
            <br />
            <span className="text-white/20">Is Empty</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/30 text-lg mb-10 max-w-md"
          >
            {!user
              ? "Sign in to start building your private cinema collection."
              : "Discover films and add them to your personal collection."}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate(!user ? "/auth" : "/search")}
            className="px-10 h-16 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg shadow-purple-500/20"
          >
            {!user ? "VIP Access" : "Start Discovery"}
          </motion.button>
        </div>
        <Footer />
      </div>
    );
  }

  // MAIN VIEW
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
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <span className="text-purple-500 font-black uppercase tracking-[0.3em] text-[10px] block mb-2">
                  Private Screening Room
                </span>
                <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tighter uppercase italic text-white leading-none">
                  Your Collection
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white font-mono font-black text-lg">
                    {favorites.length}
                  </span>
                  <span className="text-white/30 text-xs font-bold uppercase tracking-widest ml-2">
                    Masterpieces
                  </span>
                </div>
              </div>
            </div>

            {/* Sort controls */}
            <div className="flex flex-wrap gap-2">
              {([
                { key: "recent", label: "Recent", icon: <Calendar className="w-3.5 h-3.5" /> },
                { key: "title", label: "A–Z", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
                { key: "rating", label: "Rating", icon: <Star className="w-3.5 h-3.5" /> },
              ] as const).map((sort) => (
                <button
                  key={sort.key}
                  onClick={() => setSortMode(sort.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    sortMode === sort.key
                      ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                  }`}
                >
                  {sort.icon}
                  {sort.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8">
            <AnimatePresence>
              {sortedFavorites.map((movie, idx) => (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03, duration: 0.4 }}
                  onClick={() => setSelectedMovie(movie)}
                  onMouseEnter={() => setHoveredId(movie.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer shadow-2xl"
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "/placeholder.svg"
                      }
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                    {/* Quick actions overlay */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMovie(movie);
                        }}
                        className="w-full py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <button
                        onClick={(e) => handleRemove(movie.id, e)}
                        className="w-full py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    {/* Heart icon */}
                    <div className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 group-hover:opacity-0 transition-opacity">
                      <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                      {movie.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Footer />
      </div>

      <EnhancedMovieModal
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        movie={selectedMovie}
      />
    </div>
  );
};

export default Favorites;
