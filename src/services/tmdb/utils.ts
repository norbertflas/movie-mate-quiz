import { TMDB_BASE_URL, getTMDBApiKey } from "./config";

export async function tmdbFetch(endpoint: string) {
  const apiKey = await getTMDBApiKey();
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}&api_key=${apiKey}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}