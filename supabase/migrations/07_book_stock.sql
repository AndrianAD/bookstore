-- ============================================================
-- Book stock: number of copies available
-- ============================================================
alter table public.books
  add column if not exists stock integer not null default 1
    check (stock >= 0);
