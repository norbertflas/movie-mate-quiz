import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MovieDetailsSection } from "./MovieDetailsSection";
import { MovieActions } from "./MovieActions";
import { MovieSocialShare } from "./MovieSocialShare";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { getMovieTrailer } from "@/services/youtube";
import type { TMDBMovie } from "@/services/tmdb";
import type { StreamingPlatformData } from "@/types/streaming";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, ExternalLink, RefreshCw } from "lucide-react";
import { useStreamingPro, MovieStreamingData } from "@/hooks/use-streaming-pro";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import StreamingBadge from "@/components/streaming/StreamingBadge";

interface UnifiedMovieDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  movie: TMDBMovie | null;
  explanations?: string[];
  streamingServices?: StreamingPlatformData[];
  streamingData?: MovieStreamingData | null; // New Pro streaming data
}

export const UnifiedMovieDetails = ({ 
  isOpen, 
  onClose, 
  movie,
  explanations,
  streamingServices: initialStreamingServices = [],
  streamingData: propsStreamingData
}: UnifiedMovieDetailsProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // Use Pro streaming hook for lazy loading
  const { fetchSingleMovie, getUserCountry, loading: streamingLoading } = useStreamingPro();
  
  // State for streaming data
  const [streamingState, setStreamingState] = useState<{
    data: MovieStreamingData | null;
    loading: boolean;
    error: string | null;
    requested: boolean;
  }>({
    data: propsStreamingData || null,
    loading: false,
    error: null,
    requested: !!propsStreamingData
  });

  // Auto-load streaming data when dialog opens if not already provided
  useEffect(() => {
    if (isOpen && movie && !streamingState.data && !streamingState.loading && !streamingState.requested) {
      loadStreamingData();
    }
  }, [isOpen, movie]);

  const loadStreamingData = async () => {
    if (!movie || streamingState.loading) return;

    setStreamingState(prev => ({ ...prev, loading: true, requested: true }));

    try {
      const data = await fetchSingleMovie(movie.id, {
        country: getUserCountry(),
        mode: 'lazy',
        cacheEnabled: true
      });

      setStreamingState({
        data,
        loading: false,
        error: null,
        requested: true
      });
    } catch (error: any) {
      setStreamingState({
        data: null,
        loading: false,
        error: error.message || 'Failed to load streaming data',
        requested: true
      });
    }
  };

  const handleWatchTrailer = async () => {
    if (!movie) return;
    
    if (!trailerUrl) {
      try {
        const url = await getMovieTrailer(movie.title, new Date(movie.release_date).getFullYear().toString());
        setTrailerUrl(url);
        if (!url) {
          toast({
            title: t("errors.trailerNotFound"),
            description: t("errors.tryAgain"),
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Error fetching trailer:', error);
        toast({
          title: t("errors.trailerError"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
        return;
      }
    }
    
    setShowTrailer(!showTrailer);
  };

  const handleRate = (rating: "like" | "dislike") => {
    setUserRating(rating);
    toast({
      title: t("ratings.saved"),
      description: t("ratings.savedDescription", { title: movie?.title }),
    });
  };

  const handleClose = () => {
    onClose();
  };

  const openStreamingService = (link: string, service: string) => {
    if (!link) {
      toast({
        title: t("streaming.linkError"),
        description: t("streaming.noLinkAvailable", { service }),
        variant: "destructive",
      });
      return;
    }
    
    let url = link;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    console.log(`Opening streaming service: ${service} with URL: ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const checkStreamingAvailability = () => {
    if (streamingState.loading) {
      toast({
        title: t("streaming.alreadyChecking"),
        description: t("streaming.pleaseWait"),
      });
      return;
    }
    
    loadStreamingData();
    
    toast({
      title: t("streaming.checking"),
      description: t("streaming.checkingDescription", { 
        title: movie?.title 
      }),
    });
  };

  const handleRetry = () => {
    loadStreamingData();
    toast({
      title: t("streaming.retrying"),
      description: t("streaming.retryingDescription"),
    });
  };

  if (!movie) return null;

  // Use Pro streaming data if available, otherwise fallback
  const hasStreamingData = streamingState.data?.streamingOptions?.length > 0;
  const streamingOptions = streamingState.data?.streamingOptions || [];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto p-0 gap-0">
            <div className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
              <div className="flex items-center justify-between p-4">
                <DialogHeader className="p-0">
                  <DialogTitle className="text-2xl font-bold">{movie.title}</DialogTitle>
                </DialogHeader>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-background/70"
                  onClick={handleClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  {showTrailer && trailerUrl ? (
                    <iframe
                      src={trailerUrl}
                      title={`${movie.title} trailer`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path || movie.poster_path}`}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  )}
                </div>
                
                <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
                  <div className="space-y-4">
                    <MovieDetailsSection
                      title={movie.title}
                      year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : ""}
                      description={movie.overview}
                      rating={movie.vote_average * 10}
                      genre="movie"
                      onWatchTrailer={handleWatchTrailer}
                      showTrailer={showTrailer}
                      explanations={explanations}
                    />
                    
                    {/* Enhanced Streaming Section with Pro data */}
                    <div className="space-y-2 border rounded-lg p-4">
                      <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <h3 className="text-lg font-semibold">
                          Gdzie obejrzeć
                        </h3>
                        <div className="flex items-center gap-2">
                          {streamingState.requested && !streamingState.loading && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={handleRetry}
                            >
                              <RefreshCw className="h-3 w-3" />
                              Odśwież
                            </Button>
                          )}
                          {streamingState.data?.lastUpdated && (
                            <Badge variant="outline" className="text-xs">
                              Sprawdzono: {new Date(streamingState.data.lastUpdated).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!streamingState.requested ? (
                        <div className="flex justify-center p-4">
                          <Button onClick={checkStreamingAvailability}>
                            Sprawdź dostępność
                          </Button>
                        </div>
                      ) : streamingState.loading ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <div className="flex gap-2 flex-wrap mb-4">
                            {[1, 2, 3, 4].map((i) => (
                              <Skeleton key={i} className="h-16 w-20 rounded-md" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground animate-pulse">
                            Wyszukiwanie w serwisach streamingowych...
                          </p>
                        </div>
                      ) : streamingState.error ? (
                        <div className="flex flex-col items-center py-4">
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Błąd podczas sprawdzania dostępności
                            </AlertDescription>
                          </Alert>
                          <Button onClick={handleRetry} variant="outline" className="mt-2">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Spróbuj ponownie
                          </Button>
                        </div>
                      ) : hasStreamingData ? (
                        <div className="space-y-4">
                          {/* Professional streaming badges */}
                          <StreamingBadge 
                            streamingOptions={streamingOptions}
                            mode="detailed"
                          />
                          
                          {/* Direct service buttons */}
                          <div className="flex flex-wrap gap-4 mt-4">
                            {streamingOptions.map((option, index) => (
                              <HoverCard key={`${option.service}-${index}`}>
                                <HoverCardTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="flex flex-col items-center gap-2 p-3 h-auto min-w-[100px]"
                                    onClick={() => openStreamingService(option.link, option.service)}
                                  >
                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-accent/10 flex items-center justify-center">
                                      <img 
                                        src={option.serviceLogo || '/streaming-icons/default.svg'}
                                        alt={option.service}
                                        className="w-10 h-10 object-contain"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                          const target = e.currentTarget;
                                          target.onerror = null;
                                          target.src = "/streaming-icons/default.svg";
                                        }}
                                      />
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-xs text-center font-medium">
                                        {option.service}
                                      </span>
                                      {option.type && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 mt-1">
                                          {option.type === 'subscription' ? 'Subskrypcja' :
                                           option.type === 'rent' ? 'Wypożycz' :
                                           option.type === 'buy' ? 'Kup' : 'Za darmo'}
                                        </Badge>
                                      )}
                                    </div>
                                  </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">
                                      Obejrzyj na {option.service}
                                      {option.type && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                          ({option.type === 'subscription' ? 'Subskrypcja' :
                                            option.type === 'rent' ? 'Wypożycz' :
                                            option.type === 'buy' ? 'Kup' : 'Za darmo'})
                                        </span>
                                      )}
                                    </h4>
                                    {option.quality && (
                                      <p className="text-sm text-muted-foreground">
                                        Jakość: {option.quality}
                                      </p>
                                    )}
                                    {option.price && (
                                      <p className="text-sm font-medium">
                                        Cena: {option.price.formatted}
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      Kliknij aby otworzyć <ExternalLink className="h-3 w-3" />
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Film obecnie niedostępny w serwisach streamingowych w Polsce
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <MovieActions
                        userRating={userRating}
                        onRate={handleRate}
                        title={movie.title}
                      />
                      
                      <MovieSocialShare
                        title={movie.title}
                        description={movie.overview}
                        url={window.location.href}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg bg-card p-4 space-y-2">
                      <h3 className="font-semibold">Szczegóły filmu</h3>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Data premiery</dt>
                          <dd>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : "-"}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Ocena</dt>
                          <dd>{movie.vote_average ? (movie.vote_average * 10).toFixed(0) : 0}%</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Głosy</dt>
                          <dd>{movie.vote_count?.toLocaleString() || 0}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Popularność</dt>
                          <dd>{movie.popularity ? Math.round(movie.popularity).toLocaleString() : 0}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};