# Migracja: Supabase + Vercel → Cloudflare (Workers + D1)

Cel: cała aplikacja (frontend + API + baza + auth) na darmowym planie
Cloudflare, pod domeną **moviefinder.io**, bez usypiania projektu.

## Architektura docelowa

```
moviefinder.io ──► Cloudflare Worker "moviefinder"
                   ├── /api/auth/*  → Better Auth (sesje cookie, D1)
                   ├── /api/*       → Hono (dane użytkownika, streaming, klucze)
                   └── /*           → statyczne assety SPA (dist/, SPA fallback)
                   Baza: D1 (SQLite) — dane użytkowników + cache streamingu
```

- `worker/` — kod backendu (Hono + Drizzle + Better Auth)
- `worker/migrations/` — migracje D1
- `scripts/supabase-to-d1.mjs` — konwersja dumpa Supabase do SQL dla D1
- `src/lib/auth-client.ts`, `src/lib/api-client.ts` — klienci dla frontendu (etap 2)

## Etapy

- **Etap 1 (ten PR)** — backend na Cloudflare, gotowy do wdrożenia.
  Aplikacja nadal działa na Supabase; nic się nie psuje.
- **Etap 2 (kolejny PR)** — przepięcie frontendu: `supabase-js` → `api-client`/`auth-client`,
  nowy formularz logowania (zamiast `@supabase/auth-ui-react`), port funkcji rekomendacji AI,
  usunięcie zależności Supabase.

## Krok po kroku (Etap 1 — wdrożenie backendu)

### 1. Logowanie i baza

```bash
npx wrangler login
npx wrangler d1 create moviefinder
```

Skopiuj `database_id` z wyniku do `wrangler.jsonc` (pole `d1_databases[0].database_id`).

### 2. Migracje schematu

```bash
npx wrangler d1 migrations apply moviefinder --remote
```

### 3. Sekrety

```bash
npx wrangler secret put BETTER_AUTH_SECRET   # np. openssl rand -base64 32
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put RAPIDAPI_KEY         # opcjonalnie
npx wrangler secret put YOUTUBE_API_KEY      # opcjonalnie
```

### 4. Import danych z Supabase

Pobierz dump (ZIP/SQL) z dashboardu Supabase (Database → Backups) albo:

```bash
npx supabase db dump --db-url "<connection-string>" -f dump.sql --data-only --schema auth,public
```

Następnie:

```bash
node scripts/supabase-to-d1.mjs dump.sql > import.sql
npx wrangler d1 execute moviefinder --remote --file=import.sql
```

> **Hasła:** Supabase trzyma hashe bcrypt, których Worker nie może
> weryfikować (limit CPU darmowego planu). Konta i dane użytkowników
> przenoszą się w całości, ale przy pierwszym logowaniu użytkownik musi
> użyć "resetu hasła" (albo po prostu ustaw nowe hasło w etapie 2 —
> przy małej liczbie kont najprościej zrobić to ręcznie).

### 5. Deploy + domena

```bash
npm run worker:deploy
```

`wrangler.jsonc` ma już skonfigurowane custom domains `moviefinder.io`
i `www.moviefinder.io` — przy pierwszym deployu Cloudflare podepnie je
automatycznie, **pod warunkiem że strefa DNS moviefinder.io jest w tym
samym koncie Cloudflare** (Websites → Add a site, przepnij nameserwery
z obecnego rejestratora). Do czasu przepięcia DNS aplikacja działa pod
`https://moviefinder.<subdomena>.workers.dev`.

Po weryfikacji można usunąć projekt z Vercela i (po etapie 2) projekt Supabase.

### 6. Test

```bash
curl https://moviefinder.io/api/health
curl -X POST https://moviefinder.io/api/streaming-availability \
  -H 'Content-Type: application/json' \
  -d '{"tmdbIds":[603],"country":"pl"}'
```

## API Workera

| Endpoint | Metoda | Auth | Opis |
|---|---|---|---|
| `/api/health` | GET | – | health check |
| `/api/auth/*` | * | – | Better Auth (sign-up/in/out, sesja, reset hasła) |
| `/api/keys/tmdb`, `/api/keys/youtube` | GET | – | parytet z funkcjami get-*-key |
| `/api/streaming-availability` | POST | – | dostępność streamingowa (batch, cache D1) |
| `/api/streaming-services` | GET | – | katalog serwisów do wyboru |
| `/api/movies/saved` | GET/POST/DELETE | ✓ | ulubione |
| `/api/movies/watched` | GET/POST/DELETE | ✓ | obejrzane/oceny |
| `/api/preferences` | GET/PUT | ✓ | preferencje serwisów |
| `/api/creators` | GET/POST/DELETE | ✓ | ulubieni twórcy |
| `/api/quiz/history` | GET/POST | ✓ | historia quizów |
| `/api/quiz/groups` | GET/POST | ✓ | grupy quizowe |

## Koszty / limity (plan darmowy)

- Workers: 100 000 żądań/dzień; D1: 5 GB, 5 mln odczytów/dzień,
  100 tys. zapisów/dzień — wielokrotnie powyżej potrzeb aplikacji.
- Brak usypiania czegokolwiek; assety i API serwowane z edge.
