
export interface MovieInsights {
  themes: string[];
  contentWarnings: string[];
  similarMovies: string[];
  targetAudience: string;
  analysis: string;
}

// Unified Movie interface that works across all components
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres?: Array<{ id: number; name: string }> | string[];
  cast?: Array<{ name: string; character: string }> | string[];
  director?: string[] | string;
  trailer_url?: string;
  // Additional properties for enhanced functionality
  tmdbId?: number;
  genre?: string; // Single genre string for compatibility
  vote_count?: number;
  popularity?: number;
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
