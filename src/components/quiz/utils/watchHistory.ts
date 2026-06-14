import { getWatchedMovies } from "@/services/watched";

export const getWatchHistoryScore = async (movieId: number): Promise<{ score: number; explanation: string }> => {
  try {
    const watchHistory = await getWatchedMovies();
    if (!watchHistory.length) {
      return { score: 0, explanation: "" };
    }

    const enjoyed = watchHistory.filter(watched => watched.rating && watched.rating > 7);
    if (enjoyed.length > 0) {
      return {
        score: 1,
        explanation: "Similar to movies you've enjoyed in the past"
      };
    }

    const recentlyWatched = watchHistory.some(watched => watched.tmdb_id === movieId);
    if (recentlyWatched) {
      return {
        score: -1,
        explanation: "You've recently watched this movie"
      };
    }

    return { score: 0, explanation: "" };
  } catch (error) {
    console.error('Error in watch history scoring:', error);
    return { score: 0, explanation: "" };
  }
};
