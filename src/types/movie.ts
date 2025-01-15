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
  streamingServices?: string[];
  tmdbId?: number;
  explanations?: string[];
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
  tags?: string[];
  tmdbId?: number;
  explanations?: string[];
}

export interface NavLinksProps {
  onNavigate?: () => void;
}