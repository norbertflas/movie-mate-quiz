import { Hono } from "hono";
import type { Env } from "../env";

// Server-side TMDB title search (multi: movies + TV + people).
// Keeps the TMDB key on the Worker, carries media_type to the client,
// and caches results at the edge for speed and rate-limit safety.

export const searchRoutes = new Hono<{ Bindings: Env }>();

export interface SearchResultItem {
  id: number;
  mediaType: "movie" | "tv" | "person";
  title: string;
  posterPath: string | null;
  profilePath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  overview: string;
  knownForDepartment?: string;
}

interface TmdbMultiResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  known_for_department?: string;
}

searchRoutes.get("/search", async (c) => {
  const q = c.req.query("q")?.trim();
  const lang = c.req.query("lang") || "en-US";
  const page = c.req.query("page") || "1";

  if (!q || q.length < 2) return c.json({ results: [] });
  if (!c.env.TMDB_API_KEY) return c.json({ error: "TMDB not configured" }, 500);

  // Edge cache keyed by the public params only (never the API key)
  const cache = caches.default;
  const cacheKey = new Request(
    new URL(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}&page=${page}`, c.req.url).toString()
  );
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const tmdbUrl =
    `https://api.themoviedb.org/3/search/multi?api_key=${c.env.TMDB_API_KEY}` +
    `&query=${encodeURIComponent(q)}&language=${encodeURIComponent(lang)}&include_adult=false&page=${page}`;

  const res = await fetch(tmdbUrl);
  if (!res.ok) return c.json({ error: "search failed" }, 502);

  const data = (await res.json()) as { results?: TmdbMultiResult[] };

  const results: SearchResultItem[] = (data.results || [])
    .filter((r) => r.media_type === "movie" || r.media_type === "tv" || r.media_type === "person")
    .map((r) => ({
      id: r.id,
      mediaType: r.media_type as SearchResultItem["mediaType"],
      title: r.title || r.name || "",
      posterPath: r.poster_path ?? null,
      profilePath: r.profile_path ?? null,
      releaseDate: r.release_date || r.first_air_date || null,
      voteAverage: r.vote_average ?? 0,
      overview: r.overview || "",
      knownForDepartment: r.known_for_department,
    }))
    .filter((r) => r.title);

  const response = c.json({ results });
  response.headers.set("Cache-Control", "public, max-age=600");
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
});
