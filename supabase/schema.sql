create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text not null unique,
  first_name text not null check (length(btrim(first_name)) > 0),
  last_name text not null check (length(btrim(last_name)) > 0),
  full_name text generated always as (
    btrim(regexp_replace(first_name || ' ' || last_name, '[[:space:]]+', ' ', 'g'))
  ) stored,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_full_name_unique
  on public.profiles (lower(full_name));

create table if not exists public.active_sessions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  session_id uuid not null,
  updated_at timestamptz not null default now()
);

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, phone, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'phone', new.phone),
    btrim(regexp_replace(coalesce(new.raw_user_meta_data ->> 'first_name', ''), '[[:space:]]+', ' ', 'g')),
    btrim(regexp_replace(coalesce(new.raw_user_meta_data ->> 'last_name', ''), '[[:space:]]+', ' ', 'g'))
  );
  return new;
end;
$$;

create or replace function public.auth_schema_ready()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select to_regclass('public.profiles') is not null
    and to_regclass('public.active_sessions') is not null;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

alter table public.profiles enable row level security;
alter table public.active_sessions enable row level security;

drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists active_sessions_read_self on public.active_sessions;
create policy active_sessions_read_self on public.active_sessions
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists active_sessions_insert_self on public.active_sessions;
create policy active_sessions_insert_self on public.active_sessions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists active_sessions_update_self on public.active_sessions;
create policy active_sessions_update_self on public.active_sessions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists active_sessions_delete_self on public.active_sessions;
create policy active_sessions_delete_self on public.active_sessions
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.active_sessions to authenticated;
grant execute on function public.auth_schema_ready() to anon, authenticated;