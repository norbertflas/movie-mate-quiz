
import { useState, useCallback } from 'react';
import { UnifiedMovieDetails } from './UnifiedMovieDetails';
import type { TMDBMovie } from '@/services/tmdb';

interface MovieModalProps {
  movie: TMDBMovie | null;
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
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback((movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  }, []);

  return { selectedMovie, isModalOpen, openModal, closeModal };
};
