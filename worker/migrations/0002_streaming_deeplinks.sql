-- Migration number: 0002 	 streaming deep links cache
-- Per-title deep links resolved from RapidAPI (MovieOfTheNight), cached
-- ~7 days so we don't hit RapidAPI on every page view.
CREATE TABLE IF NOT EXISTS streaming_deeplinks (
  tmdb_id INTEGER NOT NULL,
  country TEXT NOT NULL,
  links TEXT NOT NULL,
  cached_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (tmdb_id, country)
);
