
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/LoadingState";
import { EmptyFavorites } from "@/components/pages/EmptyFavorites";
import { OptimizedMovieGrid } from "@/components/movie/OptimizedMovieGrid";
import { UnifiedMovieDetails } from "@/components/movie/UnifiedMovieDetails";
import type { TMDBMovie } from "@/services/tmdb";

const Favorites = () => {
  const { session } = useAuth();
  const user = session?.user;
  const [favorites, setFavorites] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_movies')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert saved movies to TMDBMovie format with proper poster handling
      const movieData: TMDBMovie[] = data?.map(movie => ({
        id: movie.tmdb_id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        overview: "",
        release_date: "",
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        adult: false,
        backdrop_path: null,
        original_language: "",
        original_title: movie.title,
        popularity: 0,
        video: false
      })) || [];

      setFavorites(movieData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <EmptyFavorites />;
  }

  if (favorites.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length} movie{favorites.length !== 1 ? 's' : ''} in your favorites
          </p>
        </div>

        <OptimizedMovieGrid 
          movies={favorites}
          onMovieClick={handleMovieClick}
        />

        <UnifiedMovieDetails
          isOpen={!!selectedMovie}
          onClose={handleCloseDetails}
          movie={selectedMovie}
        />
      </div>
    </div>
  );
};

export default Favorites;
