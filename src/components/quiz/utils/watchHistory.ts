import { supabase } from "@/integrations/supabase/client";

export const getWatchHistoryScore = async (movieId: number): Promise<{ score: number; explanation: string }> => {
  try {
    const { data: watchHistory } = await supabase
      .from('watched_movies')
      .select('tmdb_id, rating')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (!watchHistory) {
      return { score: 0, explanation: "" };
    }

    const similarGenreMovies = watchHistory.filter(watched => 
      watched.rating && watched.rating > 7
    );
    
    if (similarGenreMovies.length > 0) {
      return { 
        score: 1, 
        explanation: "Similar to movies you've enjoyed in the past" 
      };
    }

    const recentlyWatched = watchHistory.some(watched => 
      watched.tmdb_id === movieId
    );
    
    if (recentlyWatched) {
      return { 
        score: -1, 
        explanation: "You've recently watched this movie" 
      };
    }

    return { score: 0, explanation: "" };
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return { score: 0, explanation: "" };
  }
};