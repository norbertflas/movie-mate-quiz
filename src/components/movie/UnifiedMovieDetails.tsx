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
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";

interface UnifiedMovieDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  movie: TMDBMovie | null;
  explanations?: string[];
  streamingServices?: Array<{
    service: string;
    link: string;
    logo?: string;
  }>;
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
  
  const { data: availabilityData, isLoading: isLoadingServices, isError } = useStreamingAvailability(
    movie?.id,
    movie?.title,
    movie?.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined
  );

  const services = availabilityData?.services || initialStreamingServices;
  const lastUpdated = availabilityData?.timestamp ? new Date(availabilityData.timestamp) : null;
  const isDataStale = lastUpdated && (Date.now() - lastUpdated.getTime() > 24 * 60 * 60 * 1000);

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

  if (!movie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{movie.title}</DialogTitle>
            </DialogHeader>
            
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{t("streaming.availableOn")}</h3>
                      {lastUpdated && (
                        <span className="text-xs text-muted-foreground">
                          {t("streaming.lastChecked", {
                            time: lastUpdated.toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          })}
                        </span>
                      )}
                    </div>

                    {isLoadingServices ? (
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-8 w-24" />
                        ))}
                      </div>
                    ) : isError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {t("streaming.errorChecking")}
                        </AlertDescription>
                      </Alert>
                    ) : services.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {t("streaming.notAvailable")}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {isDataStale && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {t("streaming.dataStale")}
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {services.map((service, index) => (
                            <HoverCard key={`${service.service}-${index}`}>
                              <HoverCardTrigger asChild>
                                <a
                                  href={service.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center"
                                >
                                  <Badge 
                                    variant="secondary" 
                                    className="flex items-center gap-2 hover:bg-accent cursor-pointer"
                                  >
                                    {service.logo ? (
                                      <img 
                                        src={service.logo}
                                        alt={service.service}
                                        className="w-4 h-4 object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = `/streaming-icons/${service.service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.svg`;
                                        }}
                                      />
                                    ) : (
                                      <img 
                                        src={`/streaming-icons/${service.service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.svg`}
                                        alt={service.service}
                                        className="w-4 h-4 object-contain"
                                      />
                                    )}
                                    {service.service}
                                  </Badge>
                                </a>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">
                                    {t("streaming.watchOn", { service: service.service })}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {t("streaming.clickToWatch")}
                                  </p>
                                  {isDataStale && (
                                    <p className="text-sm text-yellow-500">
                                      {t("streaming.availabilityMayChange")}
                                    </p>
                                  )}
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <MovieActions
                      userRating={userRating}
                      showTrailer={showTrailer}
                      onToggleTrailer={handleWatchTrailer}
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
                    <h3 className="font-semibold">{t("movie.details")}</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">{t("movie.releaseDate")}</dt>
                        <dd>{new Date(movie.release_date).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("movie.rating")}</dt>
                        <dd>{movie.vote_average ? (movie.vote_average * 10).toFixed(0) : 0}%</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("movie.votes")}</dt>
                        <dd>{movie.vote_count?.toLocaleString() || 0}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("movie.popularity")}</dt>
                        <dd>{movie.popularity ? Math.round(movie.popularity).toLocaleString() : 0}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
