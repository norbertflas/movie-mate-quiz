
import { useState, useCallback } from 'react';
import { UnifiedMovieDetails } from './UnifiedMovieDetails';
import type { Movie } from '@/types/movie';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieModal = ({ movie, isOpen, onClose }: MovieModalProps) => {
  if (!movie) return null;

  return (
    <UnifiedMovieDetails
      isOpen={isOpen}
      onClose={onClose}
      movie={movie}
      explanations={movie.explanations}
    />
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
