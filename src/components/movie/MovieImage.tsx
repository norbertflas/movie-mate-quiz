
import { OptimizedMovieImage } from "./OptimizedMovieImage";
import type { MovieImageProps } from "@/types/movie";

// Backward compatibility wrapper
export const MovieImage = (props: MovieImageProps) => {
  return <OptimizedMovieImage {...props} />;
};
