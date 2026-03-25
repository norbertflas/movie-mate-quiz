
import { useState, useEffect } from "react";
import {
  X, Star, Play, Calendar, Clock, Users,
  Award, Bookmark, Share2, Check, Plus,
  Copy, ExternalLink, Film, Camera, Edit3, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TMDBMovie } from "@/services/tmdb";
import StreamingServiceButtons from "../streaming/StreamingServiceButtons";

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
  streamingServices = [],
}: EnhancedMovieModalProps) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showTrailer, setShowTrailer] = useState(false);
  const [userActions, setUserActions] = useState({
    isFavorite: false,
    isWatchlisted: false,
    personalRating: 0,
  });
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    if (!movie || !isOpen) return;
    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        const userLocale = navigator.language || "en-US";
        const movieLang = userLocale.split("-")[0];
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${await import("@/services/tmdb/config").then((m) => m.getTMDBApiKey())}&append_to_response=credits,videos,images,similar,reviews&language=${movieLang}`
        );
        if (response.ok) {
          setMovieDetails(await response.json());
        } else {
          throw new Error("API failed");
        }
      } catch {
        setMovieDetails({
          ...movie,
          runtime: Math.floor(Math.random() * 60) + 90,
          budget: 0,
          revenue: 0,
          credits: { cast: [], crew: [] },
          videos: { results: [] },
          similar: { results: [] },
          reviews: { results: [] },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [movie, isOpen]);

  if (!isOpen || !movie) return null;

  if (loading || !movieDetails) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-purple-600/20 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(168,85,247,0.3)] mx-auto mb-6">
            <Film className="w-10 h-10 text-white" />
          </div>
          <p className="text-white/40 font-bold">Loading premiere...</p>
        </div>
      </div>
    );
  }

  const director = movieDetails.credits?.crew?.find((c: any) => c.job === "Director");
  const tabs = ["Overview", "Cast", "Media", "Details", "Reviews"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          className="relative w-full max-w-7xl bg-[#0a0a12] rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[95vh] border border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls */}
          <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
            <button
              onClick={() =>
                setUserActions((p) => ({ ...p, isWatchlisted: !p.isWatchlisted }))
              }
              className={`p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all ${
                userActions.isWatchlisted
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {userActions.isWatchlisted ? <Check size={24} /> : <Plus size={24} />}
            </button>
            <button
              onClick={onClose}
              className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Hero Backdrop - 70% height */}
          <div className="relative h-[350px] w-full shrink-0">
            <img
              src={
                movieDetails.backdrop_path
                  ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`
                  : "/placeholder.svg"
              }
              alt={movieDetails.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              style={{
                maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12]/80 via-transparent to-[#0a0a12]/40" />

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <div className="flex items-end gap-8">
                {/* Poster */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden sm:block flex-shrink-0"
                >
                  <img
                    src={
                      movieDetails.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
                        : "/placeholder.svg"
                    }
                    alt={movieDetails.title}
                    className="w-40 h-60 object-cover rounded-2xl shadow-2xl border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                {/* Title & meta */}
                <div className="flex-1">
                  <h1 className="text-5xl sm:text-7xl font-black font-display tracking-tighter leading-none text-white italic mb-4">
                    {movieDetails.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/40 text-sm font-bold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {movieDetails.release_date?.split("-")[0]}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatRuntime(movieDetails.runtime || 120)}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5 text-yellow-400">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {(movieDetails.vote_average || 0).toFixed(1)}
                    </span>
                    {director && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <span className="text-purple-400">{director.name}</span>
                      </>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {movieDetails.genres?.map((genre: any) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-12 pt-4">
            <div className="flex gap-1 border-b border-white/5 pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-purple-500 text-white"
                      : "border-transparent text-white/30 hover:text-white/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === "Overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-3 gap-10"
                >
                  {/* Left: Overview + Streaming */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Overview box */}
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                      <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">
                        Overview
                      </h3>
                      <p className="text-white/60 leading-relaxed text-lg">
                        {movieDetails.overview || movie.overview}
                      </p>
                    </div>

                    {/* Stats bento */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { icon: <Star className="w-5 h-5 text-yellow-400" />, label: "TMDB Score", value: `${(movieDetails.vote_average || 0).toFixed(1)}/10` },
                        { icon: <Users className="w-5 h-5 text-blue-400" />, label: "Votes", value: (movieDetails.vote_count || 0).toLocaleString() },
                        { icon: <Award className="w-5 h-5 text-purple-400" />, label: "Popularity", value: (movieDetails.popularity || 0).toFixed(0) },
                        { icon: <Clock className="w-5 h-5 text-green-400" />, label: "Runtime", value: formatRuntime(movieDetails.runtime || 120) },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
                        >
                          <div className="flex justify-center mb-2">{stat.icon}</div>
                          <div className="text-white font-black text-lg">{stat.value}</div>
                          <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Where to Watch */}
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                      <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">
                        Where to Watch
                      </h3>
                      <StreamingServiceButtons
                        tmdbId={movie.id}
                        title={movieDetails.title}
                        year={movieDetails.release_date?.split("-")[0]}
                      />
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <div className="space-y-6">
                    {/* Budget/Revenue */}
                    {(movieDetails.budget > 0 || movieDetails.revenue > 0) && (
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                        <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">
                          Financials
                        </h3>
                        {movieDetails.budget > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-white/30">Budget</span>
                            <span className="text-white font-bold">{formatCurrency(movieDetails.budget)}</span>
                          </div>
                        )}
                        {movieDetails.revenue > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-white/30">Revenue</span>
                            <span className="text-green-400 font-bold">{formatCurrency(movieDetails.revenue)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cast preview */}
                    {movieDetails.credits?.cast?.length > 0 && (
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">
                          Cast
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {movieDetails.credits.cast.slice(0, 4).map((c: any) => (
                            <div key={c.id} className="flex flex-col items-center text-center group">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 border-2 border-transparent group-hover:border-purple-500 transition-all">
                                {c.profile_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                                    alt={c.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white/20" />
                                  </div>
                                )}
                              </div>
                              <div className="text-xs font-bold text-white leading-tight">{c.name}</div>
                              <div className="text-[10px] text-white/20">{c.character}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "Cast" && (
                <motion.div key="cast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {movieDetails.credits?.cast?.slice(0, 18).map((actor: any) => (
                      <div key={actor.id} className="group text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-purple-500 transition-all">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <Users className="w-8 h-8 text-white/20" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">{actor.name}</h4>
                        <p className="text-xs text-white/30">{actor.character}</p>
                      </div>
                    )) || <p className="text-white/30">No cast information</p>}
                  </div>
                </motion.div>
              )}

              {activeTab === "Media" && (
                <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {movieDetails.videos?.results?.slice(0, 4).map((video: any, i: number) => (
                      <div key={i} className="rounded-2xl overflow-hidden border border-white/5">
                        <div className="aspect-video">
                          {video.site === "YouTube" ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${video.key}`}
                              title={video.name}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <Play className="h-12 w-12 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white/[0.02]">
                          <h4 className="text-white font-bold text-sm">{video.name}</h4>
                          <p className="text-white/30 text-xs">{video.type}</p>
                        </div>
                      </div>
                    )) || <p className="text-white/30">No videos available</p>}
                  </div>
                </motion.div>
              )}

              {activeTab === "Details" && (
                <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                      <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">
                        Production Info
                      </h3>
                      {[
                        ["Budget", movieDetails.budget ? formatCurrency(movieDetails.budget) : "N/A"],
                        ["Revenue", movieDetails.revenue ? formatCurrency(movieDetails.revenue) : "N/A"],
                        ["Status", movieDetails.status || "Released"],
                        ["Runtime", formatRuntime(movieDetails.runtime || 120)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between py-3 border-b border-white/5 text-sm">
                          <span className="text-white/30">{label}</span>
                          <span className="text-white font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                      <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">
                        Companies & Countries
                      </h3>
                      {movieDetails.production_companies?.map((c: any, i: number) => (
                        <p key={i} className="text-white/60 text-sm">• {c.name}</p>
                      ))}
                      {movieDetails.production_countries?.map((c: any, i: number) => (
                        <p key={i} className="text-white/40 text-sm">📍 {c.name}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "Reviews" && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="space-y-6">
                    {movieDetails.reviews?.results?.length > 0 ? (
                      movieDetails.reviews.results.map((review: any, i: number) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-white font-bold">{review.author}</span>
                            {review.author_details?.rating && (
                              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-yellow-400 text-xs font-black">{review.author_details.rating}/10</span>
                              </div>
                            )}
                          </div>
                          <p className="text-white/40 text-sm leading-relaxed">
                            {review.content.length > 400 ? `${review.content.slice(0, 400)}...` : review.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/30 text-center py-12">No reviews available yet.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
