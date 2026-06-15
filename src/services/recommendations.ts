import { api } from "@/lib/api-client";

export interface RecommendationFilters {
  genres?: string[];
  platforms?: string[];
  mood?: string;
  region?: string;
  minRating?: number;
  mediaType?: "movie" | "tv";
  releaseYearGte?: number;
  releaseYearLte?: number;
  runtime?: { min?: number; max?: number };
}

export interface RecommendationRequest {
  answers?: { questionId: string; answer: string | string[] }[];
  filters?: RecommendationFilters;
  region?: string;
  mediaType?: "movie" | "tv";
  maxResults?: number;
}

export interface RecommendedMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  genres: string[];
  explanations: string[];
}

/**
 * Quiz / preferences based recommendations via the Cloudflare Worker
 * (TMDB Discover). Replaces the Supabase get-personalized /
 * get-enhanced recommendation edge functions. Returns [] on failure so
 * callers can apply their own local fallbacks.
 */
export async function getRecommendations(
  request: RecommendationRequest
): Promise<RecommendedMovie[]> {
  try {
    return await api.post<RecommendedMovie[]>("/recommendations", request);
  } catch (error) {
    console.error("getRecommendations failed:", error);
    return [];
  }
}
