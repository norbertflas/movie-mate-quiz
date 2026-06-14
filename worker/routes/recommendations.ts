import { Hono } from "hono";
import type { Env } from "../env";

// Quiz/preferences-based recommendations via TMDB Discover.
// Deterministic and reliable (no AI dependency): maps answers/filters to
// genres + rating + era + region and returns popular matching titles.
// Supports both movies (/discover/movie) and series (/discover/tv).

export const recommendationRoutes = new Hono<{ Bindings: Env }>();

interface QuizAnswer { questionId: string; answer: string | string[] }
interface RecoFilters {
  genres?: string[];
  platforms?: string[];
  mood?: string;
  region?: string;
  minRating?: number;
  mediaType?: "movie" | "tv";
  releaseYearGte?: number;
  releaseYearLte?: number;
  runtime?: { min?: number; max?: number };
}
interface RecoRequest {
  answers?: QuizAnswer[];
  filters?: RecoFilters;
  region?: string;
  mediaType?: "movie" | "tv";
  maxResults?: number;
}

const MOVIE_GENRE_TO_ID: Record<string, number> = {
  action: 28, adventure: 12, animation: 16, animacja: 16, comedy: 35, komedia: 35,
  crime: 80, documentary: 99, drama: 18, dramat: 18, family: 10751, fantasy: 14,
  history: 36, horror: 27, music: 10402, mystery: 9648, romance: 10749, romans: 10749,
  science_fiction: 878, "sci-fi": 878, scifi: 878, thriller: 53, war: 10752, western: 37,
  akcja: 28,
};

// TMDB TV genres are coarser; map best-effort.
const TV_GENRE_TO_ID: Record<string, number> = {
  action: 10759, adventure: 10759, akcja: 10759, animation: 16, animacja: 16,
  comedy: 35, komedia: 35, crime: 80, documentary: 99, drama: 18, dramat: 18,
  family: 10751, kids: 10762, mystery: 9648, "sci-fi": 10765, scifi: 10765,
  science_fiction: 10765, fantasy: 10765, war: 10768, western: 37,
  thriller: 9648, horror: 9648, romance: 18, romans: 18,
};

const GENRE_ID_TO_NAME: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
  10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
  10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};

const MOOD_TO_GENRES: Record<string, string[]> = {
  happy: ["comedy", "family"], funny: ["comedy", "animation"], sad: ["drama", "romance"],
  excited: ["action", "thriller", "adventure"], adrenaline: ["action", "thriller"],
  relaxed: ["documentary", "family"], relax: ["documentary", "family"],
  thoughtful: ["drama", "mystery"], romantic: ["romance", "drama"], scary: ["horror", "thriller"],
  touching: ["drama", "romance"],
};

const REGION_TO_LANG: Record<string, string> = {
  PL: "pl-PL", DE: "de-DE", FR: "fr-FR", ES: "es-ES", IT: "it-IT", US: "en-US", GB: "en-GB",
};

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch { /* not JSON */ }
  return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}

function detectTv(value: string): boolean {
  const v = value.toLowerCase();
  return v.includes("series") || v.includes("serial") || v.includes("tv") || v.includes("show");
}

interface EffectiveFilters {
  genres: string[];
  mood: string;
  region: string;
  minRating: number;
  mediaType: "movie" | "tv";
  yearGte?: number;
  yearLte?: number;
}

function buildFilters(body: RecoRequest): EffectiveFilters {
  const fromAnswers: RecoFilters = {};
  let mediaType: "movie" | "tv" = body.mediaType || body.filters?.mediaType || "movie";

  for (const a of body.answers || []) {
    const id = a.questionId.toLowerCase();
    const raw = Array.isArray(a.answer) ? a.answer.join(",") : String(a.answer);
    if (id.includes("genre")) fromAnswers.genres = [...(fromAnswers.genres || []), ...toArray(a.answer)];
    else if (id === "mood" || id.includes("mood") || id === "feeling") fromAnswers.mood = raw;
    else if (id.includes("platform") || id.includes("streaming")) fromAnswers.platforms = toArray(a.answer);
    else if (id.includes("region")) fromAnswers.region = raw;
    else if (id.includes("format") || id.includes("type") || id.includes("content")) {
      if (detectTv(raw)) mediaType = "tv";
    }
  }

  const f = { ...fromAnswers, ...body.filters };
  return {
    genres: [...new Set(f.genres || [])],
    mood: (f.mood || "").toLowerCase(),
    region: (body.region || f.region || "US").toUpperCase(),
    minRating: typeof f.minRating === "number" ? f.minRating : 0,
    mediaType,
    yearGte: f.releaseYearGte,
    yearLte: f.releaseYearLte,
  };
}

recommendationRoutes.post("/recommendations", async (c) => {
  if (!c.env.TMDB_API_KEY) return c.json({ error: "TMDB not configured" }, 500);

  const body = (await c.req.json<RecoRequest>().catch(() => ({}))) as RecoRequest;
  const f = buildFilters(body);
  const maxResults = Math.min(body.maxResults || 12, 30);
  const isTv = f.mediaType === "tv";
  const genreMap = isTv ? TV_GENRE_TO_ID : MOVIE_GENRE_TO_ID;

  const resolveGenre = (name: string): number | null => {
    const key = name.toLowerCase().replace("quiz.options.genres.", "").replace(/[^a-z_&\s-]/g, "").trim();
    return genreMap[key] ?? null;
  };

  let genreIds = f.genres.map(resolveGenre).filter((g): g is number => g != null);
  if (genreIds.length === 0 && f.mood && MOOD_TO_GENRES[f.mood]) {
    genreIds = MOOD_TO_GENRES[f.mood].map(resolveGenre).filter((g): g is number => g != null);
  }
  genreIds = [...new Set(genreIds)];

  const lang = REGION_TO_LANG[f.region] || "en-US";
  const dateField = isTv ? "first_air_date" : "primary_release_date";
  const params = new URLSearchParams({
    api_key: c.env.TMDB_API_KEY,
    sort_by: "popularity.desc",
    "vote_count.gte": "100",
    include_adult: "false",
    language: lang,
    watch_region: f.region,
    page: "1",
  });
  if (genreIds.length > 0) params.set("with_genres", genreIds.slice(0, 3).join(","));
  if (f.minRating > 0) params.set("vote_average.gte", String(f.minRating));
  if (f.yearGte) params.set(`${dateField}.gte`, `${f.yearGte}-01-01`);
  if (f.yearLte) params.set(`${dateField}.lte`, `${f.yearLte}-12-31`);
  if (body.filters?.runtime?.min && !isTv) params.set("with_runtime.gte", String(body.filters.runtime.min));
  if (body.filters?.runtime?.max && !isTv) params.set("with_runtime.lte", String(body.filters.runtime.max));

  try {
    const res = await fetch(`https://api.themoviedb.org/3/discover/${isTv ? "tv" : "movie"}?${params}`);
    if (!res.ok) return c.json({ error: "discover failed" }, 502);
    const data = (await res.json()) as { results?: any[] };

    const movies = (data.results || []).slice(0, maxResults).map((m) => {
      const ids: number[] = m.genre_ids || [];
      const names = ids.map((id) => GENRE_ID_TO_NAME[id]).filter(Boolean);
      const explanations: string[] = [];
      const matched = names.filter((n) =>
        f.genres.some((g) => n.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(n.toLowerCase()))
      );
      if (matched.length) explanations.push(`Matches your genre preference: ${matched.join(", ")}`);
      if (m.vote_average >= 8) explanations.push("Critically acclaimed");
      else if (m.vote_average >= 7.5) explanations.push("Highly rated by viewers");
      if (f.region !== "US") explanations.push(`Popular in ${f.region}`);
      if (!explanations.length) explanations.push("Popular choice matching your preferences");

      return {
        id: m.id,
        title: m.title || m.name || "",
        overview: m.overview || "",
        poster_path: m.poster_path || "",
        backdrop_path: m.backdrop_path || null,
        release_date: m.release_date || m.first_air_date || "",
        vote_average: m.vote_average ?? 0,
        vote_count: m.vote_count ?? 0,
        popularity: m.popularity ?? 0,
        genre_ids: ids,
        genres: names,
        media_type: f.mediaType,
        explanations,
      };
    });

    return c.json(movies);
  } catch (error) {
    console.error("recommendations error:", error);
    return c.json({ error: "recommendations failed" }, 500);
  }
});
