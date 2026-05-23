-- =============================================================================
-- XtravaGala — Initial Schema
-- Spec: docs/superpowers/specs/2026-05-23-database-schema-design.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";  -- for gen_random_uuid()

-- -----------------------------------------------------------------------------
-- 1. Shared trigger functions
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. profiles  (identity + host + admin)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  avatar_url    text,
  host_name     text,
  host_bio      text,
  is_host       boolean not null default false,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint host_requires_avatar_and_name
    check (is_host = false or (avatar_url is not null and host_name is not null))
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, 'New User')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin helper (used by RLS policies).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false)
$$;

-- -----------------------------------------------------------------------------
-- 3. cities
-- -----------------------------------------------------------------------------
create table public.cities (
  id          text primary key,
  name        text not null,
  image_url   text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. categories
-- -----------------------------------------------------------------------------
create table public.categories (
  id          text primary key,
  label       text not null,
  svg_content text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 5. events
-- -----------------------------------------------------------------------------
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  host_id         uuid not null references public.profiles(id) on delete cascade,
  slug            text not null unique,

  title           text not null,
  description     text,
  cover_image_url text,

  category_id     text not null references public.categories(id),
  city_id         text not null references public.cities(id),

  venue           text,
  address         text,
  start_at        timestamptz not null,
  end_at          timestamptz,

  price_php       numeric(10,2),
  capacity        int,

  schedule        jsonb not null default '[]',

  status          text not null default 'draft'
                  check (status in ('draft', 'published')),
  constraint event_end_after_start check (end_at is null or end_at > start_at),
  constraint event_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$'),
  published_at    timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index events_host_id_idx      on public.events(host_id);
create index events_city_id_idx      on public.events(city_id);
create index events_category_id_idx  on public.events(category_id);
create index events_status_start_idx on public.events(status, start_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. rsvps
-- -----------------------------------------------------------------------------
create table public.rsvps (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  event_id   uuid not null references public.events(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index rsvps_event_id_idx on public.rsvps(event_id);

-- -----------------------------------------------------------------------------
-- 7. Views (derived counts)
-- -----------------------------------------------------------------------------
-- security_invoker = true makes the view respect the caller's RLS on the
-- underlying tables (instead of running as the view owner).
create view public.events_with_counts
with (security_invoker = true) as
select
  e.*,
  coalesce(r.attendee_count, 0) as attendee_count
from public.events e
left join lateral (
  select count(*) as attendee_count from public.rsvps where event_id = e.id
) r on true;

create view public.cities_with_counts
with (security_invoker = true) as
select
  c.*,
  (select count(*) from public.events e
   where e.city_id = c.id and e.status = 'published') as event_count
from public.cities c;

-- -----------------------------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.cities      enable row level security;
alter table public.categories  enable row level security;
alter table public.events      enable row level security;
alter table public.rsvps       enable row level security;

-- ---- profiles ----
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_delete_admin_only"
  on public.profiles for delete
  using (public.is_admin(auth.uid()));

-- (No insert policy: only the on_auth_user_created trigger inserts.)

-- ---- cities ----
create policy "cities_select_all"
  on public.cities for select
  using (true);

create policy "cities_admin_write"
  on public.cities for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- categories ----
create policy "categories_select_all"
  on public.categories for select
  using (true);

create policy "categories_admin_write"
  on public.categories for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- events ----
create policy "events_select_published"
  on public.events for select
  using (status = 'published');

create policy "events_select_own_drafts"
  on public.events for select
  using (auth.uid() = host_id or public.is_admin(auth.uid()));

create policy "events_insert_host_self"
  on public.events for insert
  with check (
    auth.uid() = host_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_host = true
    )
  );

create policy "events_update_own_or_admin"
  on public.events for update
  using (auth.uid() = host_id or public.is_admin(auth.uid()))
  with check (auth.uid() = host_id or public.is_admin(auth.uid()));

create policy "events_delete_own_or_admin"
  on public.events for delete
  using (auth.uid() = host_id or public.is_admin(auth.uid()));

-- ---- rsvps ----
create policy "rsvps_select_self"
  on public.rsvps for select
  using (auth.uid() = user_id);

create policy "rsvps_select_as_host"
  on public.rsvps for select
  using (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
  );

create policy "rsvps_insert_self"
  on public.rsvps for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.status = 'published'
    )
  );

create policy "rsvps_delete_self"
  on public.rsvps for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. Storage buckets
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',      'avatars',      true, 2097152,  array['image/jpeg','image/png','image/webp']),
  ('event-covers', 'event-covers', true, 5242880,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ---- avatars policies ----
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- event-covers policies ----
create policy "event_covers_public_read"
  on storage.objects for select
  using (bucket_id = 'event-covers');

create policy "event_covers_host_write"
  on storage.objects for insert
  with check (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.host_id = auth.uid()
    )
  );

create policy "event_covers_host_update"
  on storage.objects for update
  using (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.host_id = auth.uid()
    )
  );

create policy "event_covers_host_delete"
  on storage.objects for delete
  using (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.host_id = auth.uid()
    )
  );
