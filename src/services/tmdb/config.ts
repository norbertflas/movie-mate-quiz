// All TMDB calls go through the Cloudflare Worker proxy (/api/tmdb/*),
// which injects the API key server-side. The key is never sent to the
// browser. TMDB_BASE_URL therefore points at the proxy, and callers no
// longer need a key (getTMDBApiKey returns an empty string for
// backwards compatibility with existing `api_key=${apiKey}` call sites —
// the proxy strips/overrides any api_key param).
export const TMDB_BASE_URL = "/api/tmdb";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export async function getTMDBApiKey(): Promise<string> {
  return "";
}
