import { api } from "@/lib/api-client";
import type { QuizAnswer } from "../QuizTypes";

export async function saveQuizHistory(_userId: string, answers: QuizAnswer[]): Promise<void> {
  try {
    // The Worker derives the user from the session cookie; no-op when not logged in.
    await api.post("/quiz/history", { answers });
  } catch (error) {
    console.error("Error saving quiz history:", error);
  }
}
