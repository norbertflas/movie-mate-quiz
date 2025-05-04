
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MovieDetailsSection } from "./MovieDetailsSection";
import { MovieActions } from "./MovieActions";
import { MovieSocialShare } from "./MovieSocialShare";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { getServiceIconPath, getStreamingTypeDisplay, normalizeServiceName } from "@/utils/streamingServices";

interface UnifiedMovieDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  movie: TMDBMovie | null;
  explanations?: string[];
  streamingServices?: StreamingPlatformData[];
}

export const UnifiedMovieDetails = ({ 
  isOpen, 
  onClose, 
  movie,
  explanations,
  streamingServices: initialStreamingServices = []
}: UnifiedMovieDetailsProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // Use the updated hook which doesn't auto-fetch
  const availabilityData = useStreamingAvailability(movie?.id || 0, movie?.title, 
    movie?.release_date ? new Date(movie?.release_date).getFullYear().toString() : undefined);

  // Enriched services with proper formatting from API or props
  const services = (availabilityData.services?.length > 0)
    ? availabilityData.services
    : initialStreamingServices.map(service => ({
        ...service,
        tmdbId: movie?.id,
        logo: service.logo || getServiceIconPath(service.service),
        service: normalizeServiceName(service.service)
      }));

  const lastUpdated = availabilityData.timestamp ? new Date(availabilityData.timestamp) : null;
  const isDataStale = lastUpdated && (Date.now() - lastUpdated.getTime() > 24 * 60 * 60 * 1000);
  
  const formattedLastChecked = lastUpdated 
    ? lastUpdated.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short', 
        day: 'numeric'
      });

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
        title: t("streaming.linkError", "Streaming Link Error"),
        description: t("streaming.noLinkAvailable", "No link available for {{service}}", { service }),
        variant: "destructive",
      });
      return;
    }
    
    // Fix streaming links - ensure they have proper URL format
    let url = link;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    // Add path for specific streaming sites if needed
    if (url.includes('disneyplus.com') && !url.includes('/video')) {
      url = `${url}/home`;
    } else if (url.includes('netflix.com') && !url.includes('/title')) {
      url = `${url}/browse`;
    } else if (url.includes('hbomax.com') && !url.includes('/feature')) {
      url = `${url}/movies`;
    } else if (url.includes('primevideo.com') && !url.includes('/detail')) {
      url = `${url}/storefront`;
    }
    
    console.log(`Opening streaming service: ${service} with URL: ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // New function to handle checking streaming availability on demand with error handling
  const checkStreamingAvailability = () => {
    try {
      if (availabilityData.isLoading) {
        toast({
          title: t("streaming.alreadyChecking", "Already checking"),
          description: t("streaming.pleaseWait", "Please wait while we check streaming availability"),
        });
        return;
      }
      
      availabilityData.fetchStreamingData();
      
      toast({
        title: t("streaming.checking", "Checking Availability"),
        description: t("streaming.checkingDescription", "Searching for {{title}} on streaming services", { 
          title: movie?.title 
        }),
      });
    } catch (error) {
      console.error('Error triggering streaming availability check:', error);
      toast({
        title: t("errors.generalError", "Error"),
        description: t("streaming.checkError", "Failed to check streaming availability"),
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    availabilityData.refetch();
    toast({
      title: t("streaming.retrying", "Retrying"),
      description: t("streaming.retryingDescription", "Checking streaming services again"),
    });
  };

  if (!movie) return null;

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
                      year={new Date(movie.release_date).getFullYear().toString()}
                      description={movie.overview}
                      rating={movie.vote_average * 10}
                      genre="movie"
                      onWatchTrailer={handleWatchTrailer}
                      showTrailer={showTrailer}
                      explanations={explanations}
                    />
                    
                    <div className="space-y-2 border rounded-lg p-4">
                      <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <h3 className="text-lg font-semibold">
                          {t("streaming.availableOn", "Available on")}
                        </h3>
                        <div className="flex items-center gap-2">
                          {availabilityData.requested && !availabilityData.isLoading && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={handleRetry}
                            >
                              <RefreshCw className="h-3 w-3" />
                              {t("common.refresh", "Refresh")}
                            </Button>
                          )}
                          {availabilityData.requested && (
                            <Badge variant="outline" className="text-xs">
                              {t("streaming.lastChecked", "Last checked")}: {formattedLastChecked}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!availabilityData.requested ? (
                        <div className="flex justify-center p-4">
                          <Button onClick={checkStreamingAvailability}>
                            {t("streaming.checkAvailability", "Check Streaming Availability")}
                          </Button>
                        </div>
                      ) : availabilityData.isLoading ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <div className="flex gap-2 flex-wrap mb-4">
                            {[1, 2, 3, 4].map((i) => (
                              <Skeleton key={i} className="h-16 w-20 rounded-md" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground animate-pulse">
                            {t("streaming.searching", "Searching streaming platforms...")}
                          </p>
                        </div>
                      ) : availabilityData.error ? (
                        <div className="flex flex-col items-center py-4">
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {t("streaming.errorChecking", "Error checking streaming availability")}
                            </AlertDescription>
                          </Alert>
                          <Button onClick={handleRetry} variant="outline" className="mt-2">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("common.tryAgain", "Try Again")}
                          </Button>
                        </div>
                      ) : services && services.length > 0 ? (
                        <>
                          {isDataStale && (
                            <Alert className="mb-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {t("streaming.dataStale", "This streaming information may be outdated")}
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="flex flex-wrap gap-4 mt-2">
                            {services.map((service, index) => (
                              <HoverCard key={`${service.service}-${index}`}>
                                <HoverCardTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="flex flex-col items-center gap-1 p-2 h-auto"
                                    onClick={() => openStreamingService(service.link, service.service)}
                                  >
                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-accent/10 flex items-center justify-center">
                                      <img 
                                        src={service.logo || getServiceIconPath(service.service)}
                                        alt={service.service}
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
                                        {t(`services.${service.service.toLowerCase()}`, { defaultValue: service.service })}
                                      </span>
                                      {service.type && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                                          {t(`streaming.types.${service.type}`, { defaultValue: getStreamingTypeDisplay(service.type) })}
                                        </Badge>
                                      )}
                                    </div>
                                  </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-semibold">
                                      {t("streaming.watchOn", "Watch on {{service}}", { service: t(`services.${service.service.toLowerCase()}`, { defaultValue: service.service }) })}
                                      {service.type && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                          ({t(`streaming.types.${service.type}`, { defaultValue: getStreamingTypeDisplay(service.type) })})
                                        </span>
                                      )}
                                    </h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      {t("streaming.clickToWatch", "Click to watch")} <ExternalLink className="h-3 w-3" />
                                    </p>
                                    {service.startDate && (
                                      <p className="text-xs text-muted-foreground">
                                        {t("streaming.availableSince", "Available since")}: {new Date(service.startDate).toLocaleDateString()}
                                      </p>
                                    )}
                                    {service.endDate && (
                                      <p className="text-xs text-yellow-500">
                                        {t("streaming.leavingSoon", "Leaving soon")}: {new Date(service.endDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {t("streaming.notAvailable", "This movie is not available for streaming in your region")}
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
                      <h3 className="font-semibold">{t("movie.details", "Details")}</h3>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">{t("movie.releaseDate", "Release Date")}</dt>
                          <dd>{new Date(movie.release_date).toLocaleDateString()}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t("movie.rating", "Rating")}</dt>
                          <dd>{movie.vote_average ? (movie.vote_average * 10).toFixed(0) : 0}%</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t("movie.votes", "Votes")}</dt>
                          <dd>{movie.vote_count?.toLocaleString() || 0}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t("movie.popularity", "Popularity")}</dt>
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
