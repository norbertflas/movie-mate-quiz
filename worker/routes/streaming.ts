import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { streamingCache } from "../db/schema";
import { fetchStreamingData, buildResult, type MovieStreamingData, type MediaType } from "../lib/streaming";
import type { Env } from "../env";

const CACHE_TTL_HOURS_DATA = 24;
const CACHE_TTL_HOURS_EMPTY = 6;
const MAX_BATCH = 50;

export const streamingRoutes = new Hono<{ Bindings: Env }>();

// POST /api/streaming-availability
//   { tmdbIds: number[], country?, forceRefresh? }                  (movie heuristic)
//   { items: {tmdbId, mediaType}[], country?, forceRefresh? }       (exact per title)
// Same response contract as the streaming-availability-pro Supabase function.
streamingRoutes.post("/streaming-availability", async (c) => {
  const body = await c.req.json<{
    tmdbIds?: number[];
    items?: { tmdbId: number; mediaType?: MediaType }[];
    country?: string;
    forceRefresh?: boolean;
  }>().catch(() => null);

  // Accept either a plain id list or {tmdbId, mediaType} items.
  const tmdbIds = body?.items
    ? body.items.map(i => i.tmdbId)
    : body?.tmdbIds;
  const mediaTypeById = new Map<number, MediaType | undefined>(
    (body?.items || []).map(i => [i.tmdbId, i.mediaType])
  );
  // Client country wins (it carries the user's manual choice / edge-cached
  // region); fall back to the Cloudflare edge country, then PL.
  const cfCountry = (c.req.raw as unknown as { cf?: { country?: string } }).cf?.country;
  const country = (body?.country || cfCountry || "pl").toUpperCase();
  const forceRefresh = body?.forceRefresh === true;

  if (!tmdbIds || !Array.isArray(tmdbIds) || tmdbIds.length === 0) {
    return c.json({ error: "Invalid tmdbIds array" }, 400);
  }

  const uniqueIds = [...new Set(tmdbIds.filter(id => Number.isInteger(id) && id > 0))].slice(0, MAX_BATCH);
  const db = drizzle(c.env.DB);

  // 1. D1 cache
  const cachedResults = new Map<number, MovieStreamingData>();
  if (!forceRefresh && uniqueIds.length > 0) {
    try {
      const rows = await db
        .select()
        .from(streamingCache)
        .where(and(
          inArray(streamingCache.tmdbId, uniqueIds),
          eq(streamingCache.country, country),
          gte(streamingCache.expiresAt, new Date())
        ));

      for (const row of rows) {
        try {
          const entry = JSON.parse(row.streamingData) as MovieStreamingData;
          if (entry && Array.isArray(entry.streamingOptions)) {
            cachedResults.set(row.tmdbId, { ...entry, source: "cache" });
          }
        } catch { /* corrupt cache entry — refetch below */ }
      }
    } catch (error) {
      console.error("Cache read failed:", error);
    }
  }

  // 2. Fetch only what's missing
  const missingIds = uniqueIds.filter(id => !cachedResults.has(id));
  const fetchedResults: MovieStreamingData[] = [];

  if (missingIds.length > 0) {
    const keys = { tmdbApiKey: c.env.TMDB_API_KEY, rapidApiKey: c.env.RAPIDAPI_KEY };
    const settled = await Promise.allSettled(missingIds.map(id => fetchStreamingData(id, country, keys, mediaTypeById.get(id))));

    settled.forEach((result, index) => {
      if (result.status === "fulfilled") {
        fetchedResults.push(result.value);
      } else {
        console.error(`Fetch failed for TMDB ID ${missingIds[index]}:`, result.reason);
        fetchedResults.push(buildResult(missingIds[index], "", [], "error"));
      }
    });

    // 3. Write back to cache (skip transient errors)
    const now = Date.now();
    const rows = fetchedResults
      .filter(r => r.source !== "error")
      .map(r => ({
        tmdbId: r.tmdbId,
        country,
        streamingData: JSON.stringify(r),
        source: r.source || "api",
        cachedAt: new Date(now),
        expiresAt: new Date(now + (r.streamingOptions.length > 0 ? CACHE_TTL_HOURS_DATA : CACHE_TTL_HOURS_EMPTY) * 60 * 60 * 1000),
      }));

    if (rows.length > 0) {
      try {
        await db
          .insert(streamingCache)
          .values(rows)
          .onConflictDoUpdate({
            target: [streamingCache.tmdbId, streamingCache.country],
            set: {
              streamingData: sql`excluded.streaming_data`,
              source: sql`excluded.source`,
              cachedAt: sql`excluded.cached_at`,
              expiresAt: sql`excluded.expires_at`,
            },
          });
      } catch (error) {
        console.error("Cache write failed:", error);
      }
    }
  }

  const results = [...cachedResults.values(), ...fetchedResults];

  return c.json({
    success: true,
    data: results,
    totalProcessed: uniqueIds.length,
    totalFound: results.filter(r => r.hasStreaming).length,
    fromCache: cachedResults.size,
    country,
    timestamp: new Date().toISOString(),
  });
});
