-- ============================================================
-- Ordering through the Telegram bot
-- ============================================================

-- Who placed the order in Telegram (@username or a numeric user id)
alter table public.orders
  add column if not exists customer_telegram text;

-- The book a Telegram user picked, kept until they send a phone number
create table if not exists public.bot_sessions (
  chat_id    bigint primary key,
  book_id    uuid not null references public.books (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- No policies: only the server (service role key) reads and writes sessions
alter table public.bot_sessions enable row level security;

notify pgrst, 'reload schema';
