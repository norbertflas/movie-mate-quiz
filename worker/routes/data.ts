import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { and, desc, eq } from "drizzle-orm";
import {
  savedMovies,
  watchedMovies,
  userStreamingPreferences,
  favoriteCreators,
  quizHistory,
  quizGroups,
  streamingServices,
} from "../db/schema";
import { createAuth } from "../auth";
import type { Env } from "../env";

type Variables = {
  userId: string;
};

export const dataRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------- public ----------

// Catalog of selectable streaming services (was the streaming_services table)
dataRoutes.get("/streaming-services", async (c) => {
  const db = drizzle(c.env.DB);
  const services = await db.select().from(streamingServices);
  return c.json(services);
});

// ---------- auth required below ----------

dataRoutes.use("*", async (c, next) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("userId", session.user.id);
  await next();
});

// ---------- saved movies (favorites) ----------

dataRoutes.get("/movies/saved", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db
    .select()
    .from(savedMovies)
    .where(eq(savedMovies.userId, c.get("userId")))
    .orderBy(desc(savedMovies.createdAt));
  return c.json(rows);
});

dataRoutes.post("/movies/saved", async (c) => {
  const body = await c.req.json<{ tmdbId: number; title?: string; posterPath?: string }>();
  if (!Number.isInteger(body?.tmdbId)) return c.json({ error: "tmdbId required" }, 400);

  const db = drizzle(c.env.DB);
  await db
    .insert(savedMovies)
    .values({
      id: crypto.randomUUID(),
      userId: c.get("userId"),
      tmdbId: body.tmdbId,
      title: body.title || "",
      posterPath: body.posterPath ?? null,
      createdAt: new Date(),
    })
    .onConflictDoNothing();
  return c.json({ ok: true });
});

dataRoutes.delete("/movies/saved/:tmdbId", async (c) => {
  const tmdbId = parseInt(c.req.param("tmdbId"), 10);
  const db = drizzle(c.env.DB);
  await db
    .delete(savedMovies)
    .where(and(eq(savedMovies.userId, c.get("userId")), eq(savedMovies.tmdbId, tmdbId)));
  return c.json({ ok: true });
});

// ---------- watched movies / ratings ----------

dataRoutes.get("/movies/watched", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db
    .select()
    .from(watchedMovies)
    .where(eq(watchedMovies.userId, c.get("userId")))
    .orderBy(desc(watchedMovies.watchedAt));
  return c.json(rows);
});

dataRoutes.post("/movies/watched", async (c) => {
  const body = await c.req.json<{ tmdbId: number; title?: string; rating?: number }>();
  if (!Number.isInteger(body?.tmdbId)) return c.json({ error: "tmdbId required" }, 400);

  const db = drizzle(c.env.DB);
  const now = new Date();
  await db.insert(watchedMovies).values({
    id: crypto.randomUUID(),
    userId: c.get("userId"),
    tmdbId: body.tmdbId,
    title: body.title || "",
    rating: typeof body.rating === "number" ? body.rating : null,
    watchedAt: now,
    createdAt: now,
  });
  return c.json({ ok: true });
});

dataRoutes.delete("/movies/watched/:id", async (c) => {
  const db = drizzle(c.env.DB);
  await db
    .delete(watchedMovies)
    .where(and(eq(watchedMovies.userId, c.get("userId")), eq(watchedMovies.id, c.req.param("id"))));
  return c.json({ ok: true });
});

// ---------- streaming preferences ----------

dataRoutes.get("/preferences", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db
    .select({ serviceId: userStreamingPreferences.serviceId })
    .from(userStreamingPreferences)
    .where(eq(userStreamingPreferences.userId, c.get("userId")));
  return c.json(rows.map(r => r.serviceId));
});

dataRoutes.put("/preferences", async (c) => {
  const body = await c.req.json<{ services?: string[] }>();
  const services = Array.isArray(body?.services) ? body.services.filter(s => typeof s === "string") : [];

  const db = drizzle(c.env.DB);
  const userId = c.get("userId");

  await db.delete(userStreamingPreferences).where(eq(userStreamingPreferences.userId, userId));
  if (services.length > 0) {
    await db.insert(userStreamingPreferences).values(
      services.map(serviceId => ({
        id: crypto.randomUUID(),
        userId,
        serviceId,
        createdAt: new Date(),
      }))
    );
  }
  return c.json({ ok: true });
});

// ---------- favorite creators ----------

dataRoutes.get("/creators", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db
    .select()
    .from(favoriteCreators)
    .where(eq(favoriteCreators.userId, c.get("userId")))
    .orderBy(desc(favoriteCreators.createdAt));
  return c.json(rows);
});

dataRoutes.post("/creators", async (c) => {
  const body = await c.req.json<{ name: string; role: string; tmdbPersonId?: number }>();
  if (!body?.name || !body?.role) return c.json({ error: "name and role required" }, 400);

  const db = drizzle(c.env.DB);
  await db.insert(favoriteCreators).values({
    id: crypto.randomUUID(),
    userId: c.get("userId"),
    name: body.name,
    role: body.role,
    tmdbPersonId: body.tmdbPersonId ?? 0,
    createdAt: new Date(),
  });
  return c.json({ ok: true });
});

dataRoutes.delete("/creators/:id", async (c) => {
  const db = drizzle(c.env.DB);
  await db
    .delete(favoriteCreators)
    .where(and(eq(favoriteCreators.userId, c.get("userId")), eq(favoriteCreators.id, c.req.param("id"))));
  return c.json({ ok: true });
});

// ---------- quiz history ----------

dataRoutes.get("/quiz/history", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db
    .select()
    .from(quizHistory)
    .where(eq(quizHistory.userId, c.get("userId")))
    .orderBy(desc(quizHistory.createdAt));
  return c.json(rows.map(r => ({ ...r, answers: JSON.parse(r.answers) })));
});

dataRoutes.post("/quiz/history", async (c) => {
  const body = await c.req.json<{ answers: unknown }>();
  const db = drizzle(c.env.DB);
  await db.insert(quizHistory).values({
    id: crypto.randomUUID(),
    userId: c.get("userId"),
    answers: JSON.stringify(body?.answers ?? []),
    createdAt: new Date(),
  });
  return c.json({ ok: true });
});

// ---------- quiz groups ----------

dataRoutes.get("/quiz/groups", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db
    .select()
    .from(quizGroups)
    .where(eq(quizGroups.createdBy, c.get("userId")))
    .orderBy(desc(quizGroups.createdAt));
  return c.json(rows);
});

dataRoutes.post("/quiz/groups", async (c) => {
  const body = await c.req.json<{ name: string }>();
  if (!body?.name) return c.json({ error: "name required" }, 400);

  const db = drizzle(c.env.DB);
  const group = {
    id: crypto.randomUUID(),
    name: body.name,
    createdBy: c.get("userId"),
    createdAt: new Date(),
  };
  await db.insert(quizGroups).values(group);
  return c.json(group);
});
