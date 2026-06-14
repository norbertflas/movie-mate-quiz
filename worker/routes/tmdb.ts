import { Hono } from "hono";
import type { Env } from "../env";

// Transparent TMDB proxy. The browser calls /api/tmdb/<path>?<query> and
// the Worker injects the API key server-side, so the key never reaches the
// client. Read-only GET, public (TMDB data isn't user-specific), edge-cached.

export const tmdbProxyRoutes = new Hono<{ Bindings: Env }>();

tmdbProxyRoutes.get("/tmdb/*", async (c) => {
  if (!c.env.TMDB_API_KEY) return c.json({ error: "TMDB not configured" }, 500);

  const url = new URL(c.req.url);
  const path = url.pathname.replace(/^\/api\/tmdb\//, "").replace(/^\/+/, "");
  if (!path || path.includes("..")) return c.json({ error: "invalid path" }, 400);

  // Forward the caller's query params, but force our own api_key.
  const forward = new URLSearchParams(url.search);
  forward.delete("api_key");
  forward.set("api_key", c.env.TMDB_API_KEY);

  // Cache key uses the public URL (no secret in it).
  const cache = caches.default;
  const cacheKey = new Request(url.toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let upstream: Response;
  try {
    upstream = await fetch(`https://api.themoviedb.org/3/${path}?${forward.toString()}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    return c.json({ error: "TMDB unreachable" }, 502);
  }

  const body = await upstream.text();
  const response = new Response(body, {
    status: upstream.status,
    headers: {
      "Content-Type": "application/json",
      // Cache successful responses briefly at the edge.
      "Cache-Control": upstream.ok ? "public, max-age=300" : "no-store",
    },
  });
  if (upstream.ok) c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
});
