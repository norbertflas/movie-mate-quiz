import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer } from "../QuizTypes";

export async function saveQuizHistory(userId: string, answers: QuizAnswer[]): Promise<void> {
  try {
    await supabase.from('quiz_history').insert({
      user_id: userId,
      answers: answers
    });
  } catch (error) {
    console.error('Error saving quiz history:', error);
    throw error;
  }
}