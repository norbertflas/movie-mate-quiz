import { supabase } from "@/integrations/supabase/client";
import { getStreamingAvailability } from "@/services/streamingAvailability";

interface RecommendationScore {
  movieId: number;
  score: number;
  explanations: string[];
}

export async function getPersonalizedRecommendations(): Promise<RecommendationScore[]> {
  try {
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

    // Use Promise.all with map instead of forEach for async operations
    await Promise.all((availableMovies || []).map(async (movie) => {
      if (!movie.movie_metadata?.tmdb_id || processedMovies.has(movie.movie_metadata.tmdb_id)) return;

      const watchedMovie = watchedMovies?.find(wm => wm.tmdb_id === movie.movie_metadata.tmdb_id);
      if (watchedMovie) return; // Skip already watched movies

      processedMovies.add(movie.movie_metadata.tmdb_id);
      
      const explanations: string[] = [];
      let score = 0;

      // Check real-time streaming availability
      const streamingInfo = await getStreamingAvailability(movie.movie_metadata.tmdb_id);
      const availableServices = streamingInfo.map(info => info.service);
      
      const matchingServices = preferredServices.filter(service => 
        availableServices.includes(service)
      );

      if (matchingServices.length > 0) {
        score += 0.4;
        explanations.push(`Available on ${matchingServices.length} of your streaming services`);
      }

      // Add collaborative filtering score
      const { data: similarUsers } = await supabase
        .from('watched_movies')
        .select('user_id, rating')
        .eq('tmdb_id', movie.movie_metadata.tmdb_id)
        .gte('rating', 7);

      if (similarUsers && similarUsers.length > 0) {
        score += 0.3;
        explanations.push('Highly rated by users with similar taste');
      }

      if (score > 0) {
        scores.push({
          movieId: movie.movie_metadata.tmdb_id,
          score,
          explanations: explanations.filter(Boolean)
        });
      }
    }));

    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}