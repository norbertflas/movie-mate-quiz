
import { useState, useCallback } from 'react';
import { UnifiedMovieDetails } from './UnifiedMovieDetails';
import type { TMDBMovie } from '@/services/tmdb';

interface MovieModalProps {
  movie: TMDBMovie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieModal = ({ movie, isOpen, onClose }: MovieModalProps) => {
  if (!movie || !isOpen) return null;

  // Convert TMDBMovie to the format expected by UnifiedMovieDetails
  const movieWithGenreIds = {
    ...movie,
    genre_ids: movie.genre_ids || [],
    explanations: movie.explanations || []
  };

  return (
    <UnifiedMovieDetails
      isOpen={isOpen}
      onClose={onClose}
      movie={movieWithGenreIds}
      explanations={movieWithGenreIds.explanations}
    />
  );
};

export const useMovieModal = () => {
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback((movie: TMDBMovie) => {
    console.log('Opening modal for movie:', movie.title);
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log('Closing modal');
    setSelectedMovie(null);
    setIsModalOpen(false);
  }, []);

  return { selectedMovie, isModalOpen, openModal, closeModal };
};
