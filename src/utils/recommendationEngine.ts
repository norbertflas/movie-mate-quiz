import { supabase } from "@/integrations/supabase/client";
import { TMDBMovie } from "@/services/tmdb";

interface RecommendationScore {
  movieId: number;
  score: number;
  explanations: string[];
}

export async function getPersonalizedRecommendations(): Promise<RecommendationScore[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get user's watched movies
  const { data: watchedMovies } = await supabase
    .from('watched_movies')
    .select('tmdb_id, rating')
    .eq('user_id', user.id);

  // Get user's streaming preferences
  const { data: streamingPreferences } = await supabase
    .from('user_streaming_preferences')
    .select('service_id')
    .eq('user_id', user.id);

  const preferredServices = streamingPreferences?.map(pref => pref.service_id) || [];

  // Get available movies on user's preferred platforms
  const { data: availableMovies } = await supabase
    .from('movie_streaming_availability')
    .select(`
      movie_id,
      service_id,
      movie_metadata(tmdb_id)
    `)
    .in('service_id', preferredServices);

  // Calculate scores based on availability and watch history
  const scores: RecommendationScore[] = [];
  const processedMovies = new Set<number>();

  availableMovies?.forEach(movie => {
    if (!movie.movie_metadata?.tmdb_id || processedMovies.has(movie.movie_metadata.tmdb_id)) return;

    const watchedMovie = watchedMovies?.find(wm => wm.tmdb_id === movie.movie_metadata.tmdb_id);
    if (watchedMovie) return; // Skip already watched movies

    processedMovies.add(movie.movie_metadata.tmdb_id);
    
    const explanations: string[] = [];
    let score = 0;

    // Boost score if available on multiple preferred platforms
    const platformCount = availableMovies.filter(
      am => am.movie_metadata?.tmdb_id === movie.movie_metadata?.tmdb_id
    ).length;
    
    if (platformCount > 1) {
      score += 0.2;
      explanations.push(`Available on ${platformCount} of your streaming services`);
    }

    scores.push({
      movieId: movie.movie_metadata.tmdb_id,
      score,
      explanations
    });
  });

  return scores.sort((a, b) => b.score - a.score);
}