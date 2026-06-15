import { sqliteTable, text, integer, real, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";

// =====================================================
// Better Auth tables (standard schema, sqlite provider)
// =====================================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// =====================================================
// App tables (ported from Supabase public schema)
// =====================================================

export const streamingServices = sqliteTable("streaming_services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
});

export const userStreamingPreferences = sqliteTable("user_streaming_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  serviceId: text("service_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  uniqueIndex("usp_user_service_unique").on(table.userId, table.serviceId),
]);

export const favoriteCreators = sqliteTable("favorite_creators", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  tmdbPersonId: integer("tmdb_person_id").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const watchedMovies = sqliteTable("watched_movies", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  tmdbId: integer("tmdb_id").notNull(),
  title: text("title").notNull().default(""),
  rating: real("rating"),
  watchedAt: integer("watched_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const savedMovies = sqliteTable("saved_movies", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  tmdbId: integer("tmdb_id").notNull(),
  title: text("title").notNull().default(""),
  posterPath: text("poster_path"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  uniqueIndex("saved_user_movie_unique").on(table.userId, table.tmdbId),
]);

export const quizHistory = sqliteTable("quiz_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  // JSON array of quiz answers
  answers: text("answers").notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const quizGroups = sqliteTable("quiz_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const streamingCache = sqliteTable("streaming_cache", {
  tmdbId: integer("tmdb_id").notNull(),
  country: text("country").notNull(),
  // JSON-serialized MovieStreamingData
  streamingData: text("streaming_data").notNull(),
  source: text("source").notNull().default("api"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  cachedAt: integer("cached_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.tmdbId, table.country] }),
]);

// Per-title deep links to each streaming service, resolved on-click from
// RapidAPI (MovieOfTheNight) and cached so RapidAPI gets at most ~one
// request per title per week instead of one per page view.
export const streamingDeeplinks = sqliteTable("streaming_deeplinks", {
  tmdbId: integer("tmdb_id").notNull(),
  country: text("country").notNull(),
  // JSON: { "<serviceName>": "<deep link url>" }
  links: text("links").notNull(),
  cachedAt: integer("cached_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.tmdbId, table.country] }),
]);
