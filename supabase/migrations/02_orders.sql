-- ============================================================
-- Orders table
-- ============================================================
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null,
  customer_name text,
  items         jsonb not null,
  total         numeric(10, 2) not null check (total >= 0),
  status        text not null default 'new'
                check (status in ('new', 'called', 'completed', 'cancelled')),
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Anyone (anon + auth) can create an order
create policy "Anyone can create orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users (admins) can read/update/delete
create policy "Authenticated users can read orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated users can update orders"
  on public.orders for update
  to authenticated
  using (true);

create policy "Authenticated users can delete orders"
  on public.orders for delete
  to authenticated
  using (true);
