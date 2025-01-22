import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer } from "../QuizTypes";

export async function getQuizRecommendations(userId?: string) {
  try {
    console.log('Getting quiz recommendations for user:', userId);
    
    // Call the Edge Function to get personalized recommendations
    const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
      body: { answers: userId }
    });

    if (error) {
      console.error('Error calling recommendations function:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response from recommendations function:', data);
      throw new Error('Invalid recommendations response');
    }

    console.log('Received recommendations:', data);
    return data;
  } catch (error) {
    console.error('Error getting quiz recommendations:', error);
    throw error;
  }
}