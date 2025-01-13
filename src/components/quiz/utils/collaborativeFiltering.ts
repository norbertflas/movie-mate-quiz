import { supabase } from "@/integrations/supabase/client";

export const getCollaborativeScore = async (movieId: number): Promise<{ score: number; explanation: string }> => {
  try {
    const { data: similarUsers } = await supabase
      .from('watched_movies')
      .select('user_id, rating')
      .eq('tmdb_id', movieId)
      .gte('rating', 7);

    if (!similarUsers || similarUsers.length === 0) {
      return { score: 0, explanation: "" };
    }

    const averageRating = similarUsers.reduce((acc, curr) => acc + (curr.rating || 0), 0) / similarUsers.length;
    
    if (averageRating >= 8) {
      return { 
        score: 1, 
        explanation: "Highly rated by users with similar taste" 
      };
    } else if (averageRating >= 7) {
      return { 
        score: 0.7, 
        explanation: "Well-rated by users with similar preferences" 
      };
    }

    return { score: 0, explanation: "" };
  } catch (error) {
    console.error('Error in collaborative filtering:', error);
    return { score: 0, explanation: "" };
  }
};