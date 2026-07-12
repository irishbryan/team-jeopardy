# db/ — local data snapshots (git-ignored)

Everything in this directory except this README is git-ignored: production
data never goes to GitHub. Files land here via the download scripts and are
consumed by `script/bootstrap`:

- `data.dump` — pg_dump custom-format archive of all `public` schema data,
  written by `script/download-supabase-database-dump`. Preferred by
  `script/bootstrap` when present.
- `data.sql` — plain-SQL fallback snapshot (same restore path, lower
  precedence). May exist from an earlier export.

The database *schema* is not stored here — it lives in
`supabase/migrations/` and is applied by the Supabase CLI.

No data yet? Either pull production data:

    script/download-supabase-database-dump
    script/bootstrap

or start with an empty schema:

    script/bootstrap --empty
