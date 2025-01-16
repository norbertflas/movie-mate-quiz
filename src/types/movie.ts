export interface MovieCardProps {
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tmdbId: number;
  platform: string;
  imageUrl: string;
  trailerUrl: string;
  explanations?: string[];
  streamingServices?: string[];
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
  tmdbId: number;
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