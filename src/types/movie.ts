export interface MovieImageProps {
  imageUrl: string;
  title: string;
  className?: string;
  loading?: string;
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
}

export interface NavLinksProps {
  onNavigate?: () => void;
}