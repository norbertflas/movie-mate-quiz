import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MovieDetailsSection } from "./MovieDetailsSection";
import { MovieActions } from "./MovieActions";
import { MovieSocialShare } from "./MovieSocialShare";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { getMovieTrailer } from "@/services/youtube";
import { Button } from "../ui/button";
import { Play } from "lucide-react";
import type { TMDBMovie } from "@/services/tmdb";

interface MovieDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movie: TMDBMovie | null;
}

export const MovieDetailsDialog = ({ isOpen, onClose, movie }: MovieDetailsDialogProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

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
                  />
                  
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
                        <dd>{movie.vote_average * 10}%</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("movie.votes")}</dt>
                        <dd>{movie.vote_count.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("movie.popularity")}</dt>
                        <dd>{Math.round(movie.popularity).toLocaleString()}</dd>
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