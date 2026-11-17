-- ============================================================
-- Site-wide settings (a single row)
-- ============================================================
create table if not exists public.site_settings (
  id         smallint primary key default 1 check (id = 1),
  locale     text not null default 'ru' check (locale in ('uk', 'ru', 'en')),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "Site settings are publicly readable"
  on public.site_settings for select
  using (true);

create policy "Authenticated users can update site settings"
  on public.site_settings for update
  to authenticated
  using (true);
