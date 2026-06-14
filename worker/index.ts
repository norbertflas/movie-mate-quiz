import { Hono } from "hono";
import { createAuth } from "./auth";
import { streamingRoutes } from "./routes/streaming";
import { searchRoutes } from "./routes/search";
import { recommendationRoutes } from "./routes/recommendations";
import { dataRoutes } from "./routes/data";
import type { Env } from "./env";

// Single Worker serving both the API (/api/*) and the built SPA
// (static assets binding, configured in wrangler.jsonc with
// run_worker_first limited to /api/* — non-API requests are served
// directly from the asset cache and never invoke this code).

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

// Authoritative region from the Cloudflare edge (the user's real country).
// Far more accurate than guessing from browser locale/timezone; the SPA
// caches this for streaming-availability lookups. "XX"/"T1" = unknown/Tor.
app.get("/api/geo", (c) => {
  const country = (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country;
  const valid = country && country !== "XX" && country !== "T1";
  return c.json({ country: valid ? country.toUpperCase() : null });
});

// Better Auth: sign-up/sign-in/sign-out/session under /api/auth/*
app.on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

// Same contract as the old get-tmdb-key / get-youtube-key Supabase functions
app.get("/api/keys/tmdb", (c) => c.json({ key: c.env.TMDB_API_KEY }));
app.get("/api/keys/youtube", (c) => c.json({ key: c.env.YOUTUBE_API_KEY || "" }));

app.route("/api", streamingRoutes);
app.route("/api", searchRoutes);
app.route("/api", recommendationRoutes);
app.route("/api", dataRoutes);

// Non-API requests that still reach the Worker fall back to the SPA assets
app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
