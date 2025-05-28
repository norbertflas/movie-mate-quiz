
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PlayCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number | undefined;
  genres: string[] | undefined;
  cast: string[] | undefined;
  director: string[] | undefined;
  trailer_url: string | undefined;
}

interface UnifiedMovieCardProps {
  movie: Movie;
  variant?: "small" | "medium" | "large";
  onExpand?: () => void;
  showExpandButton?: boolean;
  streamingSearch?: any;
}

export const UnifiedMovieCard = ({ 
  movie, 
  variant = "small", 
  onExpand, 
  showExpandButton = false, 
  streamingSearch 
}: UnifiedMovieCardProps) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get streaming data if available
  const streamingData = streamingSearch?.getStreamingData?.(movie.id);
  const hasStreaming = streamingSearch?.hasStreaming?.(movie.id);

  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  const renderStreamingInfo = () => {
    if (!streamingData) return null;

    const bestOption = streamingData.streamingOptions?.[0];
    if (!bestOption) return null;

    return (
      <div className="absolute top-2 right-2 z-10">
        <Badge className="bg-green-500/90 text-white text-xs">
          ✓ {bestOption.service}
        </Badge>
      </div>
    );
  };

  if (variant === "small") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-card rounded-lg shadow-md overflow-hidden cursor-pointer relative group"
        onClick={onExpand}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted-foreground/20 to-muted animate-pulse" />
          )}
          
          <img
            src={imageUrl}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />

          {/* Streaming info overlay */}
          {renderStreamingInfo()}

          {/* Rating badge */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
          </div>

          {/* Expand button */}
          {showExpandButton && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="sm" variant="secondary">
                {t("common.viewDetails")}
              </Button>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
          </p>
        </div>
      </motion.div>
    );
  }

  if (variant === "medium") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-card rounded-lg shadow-md overflow-hidden cursor-pointer relative group"
        onClick={onExpand}
      >
        <div className="relative aspect-[9/16] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted-foreground/20 to-muted animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {/* Streaming info overlay */}
          {renderStreamingInfo()}
          {/* Rating badge */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
          </div>
          {/* Expand button */}
          {showExpandButton && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="sm" variant="secondary">
                {t("common.viewDetails")}
              </Button>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
          </p>
        </div>
      </motion.div>
    );
  }

  if (variant === "large") {
    return (
      <Card className="w-full h-full overflow-hidden">
        <CardHeader>
          <CardTitle>{movie.title}</CardTitle>
          <CardDescription>
            {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative w-full overflow-hidden rounded-md border">
            <AspectRatio ratio={16 / 9}>
              <img
                src={imageUrl}
                alt={movie.title}
                className="object-cover"
              />
            </AspectRatio>
          </div>
          <p>{movie.overview}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Badge variant="secondary">
            ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
          </Badge>
          <Button>
            <PlayCircle className="mr-2 h-4 w-4" /> Play
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
};

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieModal = ({ movie, isOpen, onClose }: MovieModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{movie?.title}</DialogTitle>
          <DialogDescription>
            {movie?.release_date ? new Date(movie?.release_date).getFullYear() : "N/A"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative w-full overflow-hidden rounded-md border">
            <AspectRatio ratio={16 / 9}>
              <img
                src={movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie?.poster_path}` : '/placeholder.svg'}
                alt={movie?.title}
                className="object-cover"
              />
            </AspectRatio>
          </div>
          <p>{movie?.overview}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const useMovieModal = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  }, []);

  return { selectedMovie, isModalOpen, openModal, closeModal };
};
