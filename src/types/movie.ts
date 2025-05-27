
export interface MovieInsights {
  themes: string[];
  contentWarnings: string[];
  similarMovies: string[];
  targetAudience: string;
  analysis: string;
}

export interface MovieCardProps {
  title: string;
  year: string;
  platform: string;
  genre: string;
  imageUrl: string;
  description: string;
  trailerUrl: string;
  rating: number;
  tags?: string[];
  streamingServices?: Array<string | { service: string; link?: string; logo?: string }>;
  tmdbId?: number;
  explanations?: string[];
  onClose?: () => void;
  isExpanded?: boolean;
  onClick?: () => void;
  // New properties for improved cards
  isWatched?: boolean;
  isWatchlisted?: boolean;
  hasTrailer?: boolean;
  priority?: boolean;
  director?: string;
  runtime?: number;
  releaseDate?: string;
  cast?: string[];
  budget?: string;
  popularity?: number;
  personalRating?: number;
  onMinimize?: () => void;
  onExpand?: () => void;
}

export interface MovieImageProps {
  imageUrl: string;
  title: string;
  className?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
}

export interface MovieCardContentProps {
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tmdbId?: number;
  explanations?: string[];
  streamingServices?: string[];
  isExpanded?: boolean;
  showTrailer?: boolean;
  onWatchTrailer?: () => void;
  userRating?: "like" | "dislike" | null;
  onRate?: (rating: "like" | "dislike") => (e: React.MouseEvent) => void;
  tags?: string[];
}

export interface NavLinksProps {
  onNavigate?: () => void;
}
