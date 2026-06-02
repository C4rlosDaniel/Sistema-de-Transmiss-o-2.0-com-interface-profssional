
-- Tables
create table public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('image','video')),
  url text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create table public.presentations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  media_ids uuid[] not null default '{}',
  duration_ms integer not null default 5000,
  loop boolean not null default true,
  description text not null default '',
  transition text not null default 'fade',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.terminals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  presentation_id uuid references public.presentations(id) on delete set null,
  active boolean not null default true,
  resolution text not null default '1920x1080',
  refresh_token bigint not null default 0,
  last_sync timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Grants (open digital signage system, no per-user auth)
grant select, insert, update, delete on public.media to anon, authenticated;
grant select, insert, update, delete on public.presentations to anon, authenticated;
grant select, insert, update, delete on public.terminals to anon, authenticated;
grant all on public.media to service_role;
grant all on public.presentations to service_role;
grant all on public.terminals to service_role;

-- RLS - open (this is a private LAN-style digital signage system)
alter table public.media enable row level security;
alter table public.presentations enable row level security;
alter table public.terminals enable row level security;

create policy "open all" on public.media for all to anon, authenticated using (true) with check (true);
create policy "open all" on public.presentations for all to anon, authenticated using (true) with check (true);
create policy "open all" on public.terminals for all to anon, authenticated using (true) with check (true);

-- Realtime
alter table public.media replica identity full;
alter table public.presentations replica identity full;
alter table public.terminals replica identity full;
alter publication supabase_realtime add table public.media;
alter publication supabase_realtime add table public.presentations;
alter publication supabase_realtime add table public.terminals;

-- updated_at trigger for presentations
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger presentations_touch
before update on public.presentations
for each row execute function public.touch_updated_at();
