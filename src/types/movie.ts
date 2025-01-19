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
  streamingServices?: string[];
  tmdbId?: number;
  explanations?: string[];
  onClose?: () => void;
}