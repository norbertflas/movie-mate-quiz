export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;

  /** Public app URL, e.g. https://moviefinder.io */
  APP_URL: string;

  /** Secrets (wrangler secret put <NAME>) */
  BETTER_AUTH_SECRET: string;
  TMDB_API_KEY: string;
  RAPIDAPI_KEY?: string;
  YOUTUBE_API_KEY?: string;
}
