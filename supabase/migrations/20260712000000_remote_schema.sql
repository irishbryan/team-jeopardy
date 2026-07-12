-- Canonical migration for the exported live application schema.
-- This intentionally replaces the repository's divergent historical migrations.

create table public.games (
  id uuid not null default gen_random_uuid(),
  name text not null,
  categories jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  slug text,
  constraint games_pkey primary key (id),
  constraint categories_is_array check (jsonb_typeof(categories) = 'array'::text)
);

alter table public.games enable row level security;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.generate_unique_slug(base_name text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  base_slug text;
  final_slug text;
  counter integer := 1;
begin
  base_slug := lower(regexp_replace(regexp_replace(base_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
  final_slug := base_slug;

  while exists (select 1 from public.games where slug = final_slug) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;

  return final_slug;
end;
$function$;

create trigger update_games_updated_at
before update on public.games
for each row execute function public.update_updated_at_column();

create policy "Games are publicly viewable"
on public.games
for select
to public
using (true);

create policy "Allow game creation"
on public.games
for insert
to public
with check (true);

create policy "Allow game updates"
on public.games
for update
to public
using (true);

create policy "No game deletion"
on public.games
for delete
to public
using (false);

grant all privileges on table public.games to anon, authenticated, service_role;
grant execute on function public.update_updated_at_column() to anon, authenticated, service_role;
grant execute on function public.generate_unique_slug(text) to anon, authenticated, service_role;
