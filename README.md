# Team Jeopardy

A web app for creating and playing Jeopardy-style trivia games. You name a game, pick six categories, and an AI (OpenAI `gpt-4o`) writes five progressively harder questions per category. Games are saved with shareable slug URLs (`/game/seattle-trip`) and played on a classic Jeopardy board.

Originally built with [Lovable](https://lovable.dev/projects/fc38169b-edeb-467d-9171-a0976f94a076) with Supabase as the backend. This repo is now fully runnable locally.

## Quick start

Prerequisites: Docker Desktop and the [Supabase CLI](https://supabase.com/docs/guides/local-development). No Node/npm needed — the frontend runs in a container.

```sh
script/setup
script/server
```

Open http://localhost:8080. To fill the local database with production data:

```sh
script/download-supabase-database-dump
script/bootstrap
```

## Scripts

| Command | What it does | Needs |
|---|---|---|
| `script/setup` | One-time install: deps, migrations, `.env` scaffold. Rerun-safe. | — |
| `script/server` | Runs Supabase + frontend, attached. Ctrl-C stops the frontend; Supabase stays up so restarts are instant. | — |
| `script/stop` | Stops the frontend and the Supabase stack. Data persists. | — |
| `script/bootstrap [--empty] [--force]` | Loads local DB from the downloaded dump; `--empty` = schema only. | dump in `db/`, or `--empty` |
| `script/reset [--force]` | Drops local DB, replays migrations. Empty schema. | — |
| `script/download-supabase-database-dump` | Copies production data (read-only) → `db/data.dump`. | `SUPABASE_DB_PASSWORD` in `.env` |
| `script/download-supabase-storage` | Copies production Storage files (read-only) → `storage/`. | `SUPABASE_SERVICE_ROLE_KEY` in `.env` |

`download-supabase-*` scripts read from production; everything else touches only the local stack. Downloaded data is git-ignored.

| Service | URL |
|---|---|
| App (Vite dev server) | http://localhost:8080 |
| Supabase API (PostgREST, Auth, Functions) | http://127.0.0.1:54321 |
| Supabase Studio (DB admin UI) | http://127.0.0.1:54323 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## Architecture

```
Browser
  │
  ├── React SPA (Vite, :8080 in the `web` Docker container)
  │     ├── react-router: / (create), /games (list), /game/:slug (play)
  │     ├── zustand (useGameStore) for board/game state
  │     └── @supabase/supabase-js client
  │
  └──▶ Supabase local stack (Docker, managed by the Supabase CLI)
        ├── Kong API gateway            :54321
        ├── PostgREST ──▶ Postgres 17   :54322  (table: public.games)
        ├── Edge Runtime (Deno)         generate-questions ──▶ OpenAI API
        └── Studio                      :54323
```

**Frontend.** A Vite + React + TypeScript SPA (shadcn/ui, Tailwind). It talks to Supabase directly from the browser via `@supabase/supabase-js` — there is no custom API server. The client (`src/integrations/supabase/client.ts`) reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` and falls back to the hosted project when they're unset. `script/server` injects the local values, so the same code runs against either backend.

**Database.** A single table, `public.games` (id, name, slug, `categories` jsonb, timestamps). The whole board — categories, questions, answers, point values, answered state — lives in the `categories` jsonb column. Row Level Security allows public select/insert/update and blocks deletes; a trigger maintains `updated_at`, and `generate_unique_slug()` derives unique URL slugs from game names. The schema is defined by one canonical migration, `supabase/migrations/20260712000000_remote_schema.sql` (generated from the live hosted catalog — it replaces 13 divergent historical Lovable migrations that didn't replay cleanly).

**Question generation.** Creating a game calls the `generate-questions` Edge Function (Deno, served by the Supabase local stack automatically on `supabase start`). It prompts OpenAI once per category and inserts the finished game. Without an `OPENAI_API_KEY` the function returns a 503 and the app shows the error — everything else (browsing, playing existing games) works fine.

## Secrets and configuration

All secrets live in one git-ignored file: `.env` at the repo root. `script/setup` creates it from `.env.example`, which documents every value:

| Variable | Needed for | Notes |
|---|---|---|
| `OPENAI_API_KEY` | AI question generation | Optional. Scripts propagate it into `supabase/functions/.env` (also git-ignored, auto-generated — don't edit) for the local Edge Runtime. Restart `script/server` after changing it. |
| `SUPABASE_DB_PASSWORD` | `script/download-supabase-database-dump` | Optional, read-only use. Just the DB password — host/user are derived from the project ref. Write-only in Supabase; reset it under Project Settings → Database if unknown. |
| `SUPABASE_DB_URL` | `script/download-supabase-database-dump` | Alternative to the password: the full **Session pooler** string (Dashboard → Connect). Only needed if the pooler host isn't one the script tries automatically. |
| `SUPABASE_SERVICE_ROLE_KEY` | `script/download-supabase-storage` | Optional, read-only use. From Project Settings → API keys. Bypasses Storage policies — treat like a password. |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | overriding the frontend's backend | Leave empty. `script/server` injects the local stack's values; when unset entirely, the client falls back to the hosted project. |

## How local isolation works

The Supabase CLI runs the entire backend in Docker containers namespaced by the `project_id` in `supabase/config.toml` (`team-jeopardy`), with data in Docker volumes under the same namespace. Nothing here connects to the hosted project: the scripts only ever operate on the local stack, and `script/reset` deliberately never uses `--linked` or `db push`. The frontend container is defined in `docker-compose.yml` — a pinned Node 22 image with the repo bind-mounted for hot reload and `node_modules` in a named volume (so host and container dependencies never conflict).

Running against the **hosted** backend instead: just `npm run dev` on the host — with the `VITE_` vars unset, the client falls back to the hosted URL/key hardcoded in `client.ts`. The only scripts that ever contact the hosted project are the `download-supabase-*` ones, and they are read-only.

## Data policy: dumps never go to GitHub

Everything under `db/` (except its README) and `storage/` is git-ignored — production data stays out of version control. Each clone pulls its own data with the `download-supabase-*` scripts, or starts empty with `script/bootstrap --empty`. `script/bootstrap` restores the best snapshot available locally: `db/data.dump` (custom-format pg_dump, preferred) or `db/data.sql` (plain-SQL fallback).

Schema and data travel separately on purpose: schema as migrations (committed, diffable, ordered), data as git-ignored dumps — the same pattern you'd use when migrating a larger project off Supabase. `supabase/config.toml` disables CLI auto-seeding; `script/setup` and `script/bootstrap` restore snapshots explicitly so behavior is deterministic.

## Reusing this setup for other Lovable projects

This repo doubles as a template for running any Lovable-exported, Supabase-backed project locally. Project-specific values live in exactly two committed places: `script/common.sh` (project ref, region, local stack name — plus the app-specific `games_count`/`verify_schema` checks) and the hosted fallbacks in `src/integrations/supabase/client.ts`. Adapt those, put your schema in `supabase/migrations/`, and the scripts, Compose file, and `.env` layout carry over unchanged.

## Development notes

- Edit code normally; Vite hot-reloads through the bind mount. If HMR ever stops picking up changes on macOS, restart `script/server`.
- Lint/build inside the container: `docker compose run --rm web npm run lint` / `npm run build`.
- Database console: `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres`, or use Studio.
- `script/stop` (or `supabase stop`) preserves DB volumes; `supabase db reset` (via `script/reset`) is the only destructive operation.
