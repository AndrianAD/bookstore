-- ============================================================
-- Telegram channel: id of the channel post for each book
-- ============================================================
alter table public.books
  add column if not exists telegram_message_id bigint;
