-- Migration number: 0001 	 init
-- Better Auth tables + app tables ported from Supabase public schema.
-- Timestamps are unix epoch milliseconds (drizzle integer/timestamp mode).

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_idx ON session(user_id);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS account_user_idx ON account(user_id);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS streaming_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS user_streaming_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS usp_user_service_unique ON user_streaming_preferences(user_id, service_id);

CREATE TABLE IF NOT EXISTS favorite_creators (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  tmdb_person_id INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS favorite_creators_user_idx ON favorite_creators(user_id);

CREATE TABLE IF NOT EXISTS watched_movies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  rating REAL,
  watched_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS watched_movies_user_idx ON watched_movies(user_id);

CREATE TABLE IF NOT EXISTS saved_movies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  poster_path TEXT,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS saved_user_movie_unique ON saved_movies(user_id, tmdb_id);

CREATE TABLE IF NOT EXISTS quiz_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  answers TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS quiz_history_user_idx ON quiz_history(user_id);

CREATE TABLE IF NOT EXISTS quiz_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS streaming_cache (
  tmdb_id INTEGER NOT NULL,
  country TEXT NOT NULL,
  streaming_data TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'api',
  expires_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL,
  PRIMARY KEY (tmdb_id, country)
);

-- Seed selectable streaming services (same set as Supabase)
INSERT OR IGNORE INTO streaming_services (id, name, logo_url) VALUES
  ('netflix', 'Netflix', '/streaming-icons/netflix.svg'),
  ('disney', 'Disney+', '/streaming-icons/disneyplus.svg'),
  ('hbomax', 'Max', '/streaming-icons/max.svg'),
  ('prime', 'Amazon Prime Video', '/streaming-icons/prime.svg'),
  ('hulu', 'Hulu', '/streaming-icons/hulu.svg'),
  ('appletv', 'Apple TV+', '/streaming-icons/appletv.svg'),
  ('paramount', 'Paramount+', '/streaming-icons/paramount.svg');
