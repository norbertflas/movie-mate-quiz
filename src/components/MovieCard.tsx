import { MovieCardBase } from "./movie/MovieCardBase";

interface MovieCardProps {
  id?: number;
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
}

export const MovieCard = (props: MovieCardProps) => {
  return <MovieCardBase {...props} />;
};