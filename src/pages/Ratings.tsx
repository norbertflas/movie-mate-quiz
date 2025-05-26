
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/LoadingState";
import { EmptyRatings } from "@/components/pages/EmptyRatings";
import { OptimizedMovieGrid } from "@/components/movie/OptimizedMovieGrid";
import { UnifiedMovieDetails } from "@/components/movie/UnifiedMovieDetails";
import { useTranslation } from "react-i18next";
import type { TMDBMovie } from "@/services/tmdb";

const Ratings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [ratedMovies, setRatedMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  useEffect(() => {
    if (user) {
      fetchRatings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('watched_movies')
        .select('*')
        .eq('user_id', user?.id)
        .not('rating', 'is', null)
        .order('watched_at', { ascending: false });

      if (error) throw error;

      // Convert watched movies to TMDBMovie format
      const movieData: TMDBMovie[] = data?.map(movie => ({
        id: movie.tmdb_id,
        title: movie.title,
        poster_path: "",
        overview: "",
        release_date: "",
        vote_average: movie.rating || 0,
        vote_count: 0,
        genre_ids: [],
        adult: false,
        backdrop_path: null,
        original_language: "",
        original_title: movie.title,
        popularity: 0,
        video: false
      })) || [];

      setRatedMovies(movieData);
    } catch (error) {
      console.error('Error fetching ratings:', error);
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
    return <EmptyRatings />;
  }

  if (ratedMovies.length === 0) {
    return <EmptyRatings />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("navigation.ratings")}</h1>
          <p className="text-muted-foreground">
            {t("ratings.subtitle", { count: ratedMovies.length })}
          </p>
        </div>

        <OptimizedMovieGrid 
          movies={ratedMovies}
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

export default Ratings;
