-- ============================================================
-- Book price currency: EUR or UAH
-- ============================================================
alter table public.books
  add column if not exists currency text not null default 'EUR'
    check (currency in ('EUR', 'UAH'));
