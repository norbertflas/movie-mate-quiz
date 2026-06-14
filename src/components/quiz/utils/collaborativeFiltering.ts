import { api } from "@/lib/api-client";

interface WatchedAllRow {
  userId: string;
  tmdbId: number;
  rating: number | null;
}

export const getCollaborativeScore = async (movieId: number): Promise<{ score: number; explanation: string }> => {
  try {
    let allRows: WatchedAllRow[] = [];
    try {
      allRows = await api.get<WatchedAllRow[]>("/movies/watched/all");
    } catch {
      return { score: 0, explanation: "" };
    }

    const similarUsers = allRows.filter((r) => r.tmdbId === movieId && (r.rating || 0) >= 7);

    if (similarUsers.length === 0) {
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
