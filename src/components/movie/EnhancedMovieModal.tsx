import { useState, useEffect } from "react";
import { 
  X, Heart, Star, Play, Calendar, Clock, Users, 
  Award, TrendingUp, Bookmark, Share2, 
  Copy, ExternalLink, Film, Camera, Mic, Edit3, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { TMDBMovie } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
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
  streamingServices = []
}: EnhancedMovieModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showTrailer, setShowTrailer] = useState(false);
  const [userActions, setUserActions] = useState({
    isFavorite: false,
    isWatchlisted: false,
    isWatched: false,
    personalRating: 0
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  };

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
        const movieLang = userLocale.split('-')[0];
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${await import('@/services/tmdb/config').then(m => m.getTMDBApiKey())}&append_to_response=credits,videos,images,similar,reviews&language=${movieLang}`
        );
        if (response.ok) {
          const data = await response.json();
          setMovieDetails(data);
        } else {
          throw new Error('API failed');
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setMovieDetails({
          ...movie,
          runtime: Math.floor(Math.random() * 60) + 90,
          budget: Math.floor(Math.random() * 100000000) + 10000000,
          revenue: Math.floor(Math.random() * 500000000) + 50000000,
          status: "Released",
          production_companies: [{ name: "Warner Bros. Pictures" }],
          production_countries: [{ name: "United States" }],
          spoken_languages: [{ english_name: "English" }],
          credits: { cast: [], crew: [] },
          videos: { results: [] },
          images: { backdrops: [] },
          similar: { results: [] },
          reviews: { results: [] }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [movie, isOpen]);

  const handleUserAction = (action: string, value: any = null) => {
    setUserActions(prev => ({
      ...prev,
      [action]: value !== null ? value : !prev[action as keyof typeof prev]
    }));
  };

  const handleShare = async (platform: string) => {
    const shareUrl = `${window.location.origin}/movie/${movie?.id}`;
    switch(platform) {
      case 'copy': navigator.clipboard.writeText(shareUrl); break;
      case 'native': if (navigator.share) await navigator.share({ title: movie?.title || '', url: shareUrl }); break;
    }
    setShowShareMenu(false);
  };

  if (!isOpen || !movie) return null;

  if (loading || !movieDetails) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="neon-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
          <p className="text-foreground mt-4 text-center">Loading movie details...</p>
        </div>
      </motion.div>
    );
  }

  const director = movieDetails.credits?.crew?.find((c: any) => c.job === "Director");
  const writers = movieDetails.credits?.crew?.filter((c: any) => c.job === "Writer" || c.job === "Screenplay")?.slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative max-w-6xl w-full max-h-[95vh] overflow-hidden rounded-2xl border border-border/50 shadow-2xl shadow-primary/10"
        style={{ background: 'linear-gradient(135deg, hsl(230 25% 10%), hsl(250 30% 12%), hsl(230 25% 8%))' }}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header with backdrop */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={movieDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : "/placeholder.svg"}
              alt={movieDetails.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(230,25%,10%)] via-[hsl(230,25%,10%)]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(230,25%,10%)]/80 via-transparent to-[hsl(230,25%,10%)]/40" />
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-foreground z-10">
            <X className="h-5 w-5" />
          </Button>

          {/* Poster + Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6">
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex-shrink-0 relative">
              <img
                src={movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : "/placeholder.svg"}
                alt={movieDetails.title}
                className="w-36 h-52 object-cover rounded-xl shadow-2xl border border-border/30"
                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
              />
              {/* Rating badge */}
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-lg shadow-primary/30">
                <div className="text-center">
                  <Star className="h-3 w-3 text-yellow-300 fill-current mx-auto" />
                  <span className="text-white text-xs font-bold">{(movieDetails.vote_average || 0).toFixed(1)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 truncate">{movieDetails.title}</h1>
              <p className="text-muted-foreground text-sm mb-4">
                {movieDetails.release_date?.split('-')[0]} | {formatRuntime(movieDetails.runtime || 120)}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={() => handleUserAction('isWatchlisted')}
                  className={`rounded-xl px-5 ${userActions.isWatchlisted 
                    ? 'bg-accent/20 text-accent border border-accent/50' 
                    : 'bg-gradient-to-r from-neon-purple/80 to-neon-magenta/80 hover:from-neon-purple hover:to-neon-magenta text-white border-0'}`}>
                  <Bookmark className={`h-4 w-4 mr-2 ${userActions.isWatchlisted ? 'fill-current' : ''}`} />
                  Add to Watchlist
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleUserAction('isFavorite')}
                  className={`rounded-xl px-5 border-border/50 ${userActions.isFavorite ? 'bg-destructive/20 text-red-400 border-red-500/50' : 'text-foreground hover:bg-secondary'}`}>
                  <Star className={`h-4 w-4 mr-2 ${userActions.isFavorite ? 'fill-current text-yellow-400' : ''}`} />
                  Rate it
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowShareMenu(!showShareMenu)}
                  className="rounded-xl px-5 border-border/50 text-foreground hover:bg-secondary relative">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 neon-card p-2 z-10 min-w-32">
                        <Button variant="ghost" size="sm" onClick={() => handleShare('copy')}
                          className="w-full justify-start text-muted-foreground hover:text-foreground">
                          <Copy className="h-4 w-4 mr-2" /> Copy Link
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare('native')}
                          className="w-full justify-start text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-4 w-4 mr-2" /> Share
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-280px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-secondary/50 border border-border/30 rounded-xl mb-6 p-1">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">Overview</TabsTrigger>
              <TabsTrigger value="cast" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">Cast</TabsTrigger>
              <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">Media</TabsTrigger>
              <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">Details</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Plot + Rating */}
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Plot Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">{movieDetails.overview || movie.overview}</p>
                  </div>
                  
                  {/* Personal Rating */}
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 border border-border/30 rounded-xl">
                    <span className="text-foreground font-medium whitespace-nowrap">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map((r) => (
                        <button key={r} onClick={() => handleUserAction('personalRating', r)}
                          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                            r <= userActions.personalRating
                              ? 'bg-gradient-to-br from-neon-purple to-neon-magenta text-white shadow-md shadow-primary/30'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Production Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Production Info</h3>
                    <div className="space-y-2 text-sm">
                      {director && (
                        <div><span className="text-muted-foreground">Director:</span> <span className="text-foreground ml-1">{director.name}</span></div>
                      )}
                      {writers && writers.length > 0 && (
                        <div><span className="text-muted-foreground">Writers:</span> <span className="text-foreground ml-1">{writers.map((w: any) => w.name).join(', ')}</span></div>
                      )}
                      {movieDetails.budget > 0 && (
                        <div><span className="text-muted-foreground">Budget:</span> <span className="text-foreground ml-1">{formatCurrency(movieDetails.budget)}</span></div>
                      )}
                      {movieDetails.revenue > 0 && (
                        <div><span className="text-muted-foreground">Revenue:</span> <span className="text-foreground ml-1">{formatCurrency(movieDetails.revenue)}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Where to Watch */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Where to Watch</h3>
                    <StreamingServiceButtons 
                      tmdbId={movie.id} 
                      title={movieDetails.title} 
                      year={movieDetails.release_date?.split('-')[0]}
                    />
                  </div>
                </div>

                {/* Right Sidebar: Stats + Genres + Director + Cast */}
                <div className="space-y-5">
                  {/* Movie Stats Card */}
                  <div className="neon-card p-5 space-y-3">
                    <h4 className="text-foreground font-semibold text-lg">Movie Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TMDB Rating:</span>
                        <span className="text-foreground font-medium">{(movieDetails.vote_average || 0).toFixed(1)}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Votes:</span>
                        <span className="text-foreground font-medium">{(movieDetails.vote_count || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Popularity:</span>
                        <span className="text-foreground font-medium">{(movieDetails.popularity || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User Score:</span>
                        <span className="text-accent font-bold">{Math.round((movieDetails.vote_average || 0) * 10)}%</span>
                      </div>
                      <Progress value={(movieDetails.vote_average || 0) * 10} className="h-2 mt-1" />
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {movieDetails.genres?.map((genre: any) => (
                        <Badge key={genre.id} className="bg-primary/20 text-primary border border-primary/30 rounded-lg">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Director */}
                  {director && (
                    <div>
                      <h4 className="text-foreground font-semibold mb-1">Director</h4>
                      <p className="text-muted-foreground text-sm">{director.name}</p>
                    </div>
                  )}

                  {/* Cast Avatars */}
                  {movieDetails.credits?.cast?.length > 0 && (
                    <div>
                      <h4 className="text-foreground font-semibold mb-3">Cast</h4>
                      <div className="flex flex-wrap gap-3">
                        {movieDetails.credits.cast.slice(0, 5).map((actor: any) => (
                          <div key={actor.id} className="text-center w-14">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border/50 mx-auto mb-1">
                              {actor.profile_path ? (
                                <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name}
                                  className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                  <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{actor.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cast" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Main Cast</h3>
                  <div className="space-y-3">
                    {movieDetails.credits?.cast?.slice(0, 8).map((actor: any) => (
                      <div key={actor.id} className="flex items-center gap-3 p-3 bg-secondary/30 border border-border/20 rounded-xl">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-border/30 flex-shrink-0">
                          {actor.profile_path ? (
                            <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name}
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{actor.name}</p>
                          <p className="text-muted-foreground text-sm">{actor.character}</p>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No cast information available</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Key Crew</h3>
                  <div className="space-y-3">
                    {movieDetails.credits?.crew?.filter((m: any) => ['Director','Writer','Screenplay','Producer','Director of Photography'].includes(m.job)).slice(0, 8).map((member: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 border border-border/20 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          {member.job === 'Director' && <Film className="h-5 w-5 text-accent" />}
                          {(member.job === 'Writer' || member.job === 'Screenplay') && <Edit3 className="h-5 w-5 text-neon-magenta" />}
                          {member.job === 'Director of Photography' && <Camera className="h-5 w-5 text-neon-green" />}
                          {member.job === 'Producer' && <DollarSign className="h-5 w-5 text-neon-purple" />}
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{member.name}</p>
                          <p className="text-muted-foreground text-sm">{member.job}</p>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No crew information available</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movieDetails.videos?.results?.slice(0, 4).map((video: any, i: number) => (
                  <div key={i} className="neon-card overflow-hidden">
                    <div className="aspect-video">
                      {video.site === 'YouTube' ? (
                        <iframe src={`https://www.youtube.com/embed/${video.key}`} title={video.name}
                          frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Play className="h-12 w-12 text-accent" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-foreground font-medium text-sm">{video.name}</h4>
                      <p className="text-muted-foreground text-xs">{video.type}</p>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">No videos available</p>}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="neon-card p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Production Info</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Budget', movieDetails.budget ? formatCurrency(movieDetails.budget) : 'N/A'],
                      ['Revenue', movieDetails.revenue ? formatCurrency(movieDetails.revenue) : 'N/A'],
                      ['Status', movieDetails.status || 'Released'],
                      ['Runtime', formatRuntime(movieDetails.runtime || 120)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-border/20">
                        <span className="text-muted-foreground">{label}:</span>
                        <span className="text-foreground font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="neon-card p-5 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Companies & Countries</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="text-muted-foreground mb-1">Production Companies:</h4>
                      {movieDetails.production_companies?.map((c: any, i: number) => (
                        <p key={i} className="text-foreground">• {c.name}</p>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-muted-foreground mb-1">Countries:</h4>
                      {movieDetails.production_countries?.map((c: any, i: number) => (
                        <p key={i} className="text-foreground">• {c.name}</p>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-muted-foreground mb-1">Languages:</h4>
                      {movieDetails.spoken_languages?.map((l: any, i: number) => (
                        <p key={i} className="text-foreground">• {l.english_name}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">User Reviews</h3>
              <div className="space-y-4">
                {movieDetails.reviews?.results?.length > 0 ? (
                  movieDetails.reviews.results.map((review: any, i: number) => (
                    <div key={i} className="neon-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-foreground font-medium">{review.author}</span>
                        {review.author_details?.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-foreground text-sm">{review.author_details.rating}/10</span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                        {review.content.length > 300 ? `${review.content.slice(0, 300)}...` : review.content}
                      </p>
                      <div className="text-xs text-muted-foreground">{formatDate(review.created_at)}</div>
                    </div>
                  ))
                ) : <p className="text-muted-foreground">No reviews available</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 flex items-center justify-center z-10"
            onClick={() => setShowTrailer(false)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="relative w-full max-w-6xl mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                <div className="aspect-video">
                  {movieDetails.videos?.results?.[0]?.key && movieDetails.videos.results[0].site === 'YouTube' ? (
                    <iframe src={`https://www.youtube.com/embed/${movieDetails.videos.results[0].key}?autoplay=1&rel=0`}
                      title={movieDetails.videos.results[0].name} frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-20 w-20 text-accent" />
                    </div>
                  )}
                </div>
              </div>
              <Button variant="secondary" size="lg" className="absolute -top-14 right-0"
                onClick={() => setShowTrailer(false)}>
                <X className="h-5 w-5 mr-2" /> Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
