-- ============================================================
-- Book condition: new or used
-- ============================================================
alter table public.books
  add column if not exists condition text not null default 'new'
    check (condition in ('new', 'used'));

create index if not exists books_condition_idx on public.books (condition);
