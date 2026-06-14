import { api } from "@/lib/api-client";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export async function getTMDBApiKey() {
  try {
    const { key } = await api.get<{ key: string }>("/keys/tmdb");
    if (!key) {
      throw new Error("TMDB API key not found in response");
    }
    return key;
  } catch (error) {
    console.error("Failed to get TMDB API key:", error);
    throw error;
  }
}
