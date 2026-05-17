-- ============================================================
-- Bookstore — initial migration
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- Table: books
-- ============================================================
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null,
  price       numeric(10, 2) not null check (price >= 0),
  genre       text not null default 'Другое',
  description text not null default '',
  image_url   text,
  created_at  timestamptz not null default now()
);

-- Index for fast search
create index if not exists books_title_idx  on public.books using gin (to_tsvector('russian', title));
create index if not exists books_author_idx on public.books (author);
create index if not exists books_genre_idx  on public.books (genre);
create index if not exists books_price_idx  on public.books (price);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.books enable row level security;

-- Anyone can read books
create policy "Books are publicly readable"
  on public.books for select
  using (true);

-- Only authenticated users (admins) can insert/update/delete
create policy "Authenticated users can insert books"
  on public.books for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update books"
  on public.books for update
  to authenticated
  using (true);

create policy "Authenticated users can delete books"
  on public.books for delete
  to authenticated
  using (true);

-- ============================================================
-- Storage: books-images bucket
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'books-images',
  'books-images',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Anyone can read images
create policy "Public read access for books-images"
  on storage.objects for select
  using (bucket_id = 'books-images');

-- Only authenticated users can upload images
create policy "Authenticated users can upload to books-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'books-images');

-- Only authenticated users can delete images
create policy "Authenticated users can delete from books-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'books-images');

-- ============================================================
-- Seed data (demo books)
-- ============================================================
insert into public.books (title, author, price, genre, description) values
  ('Мастер и Маргарита', 'Михаил Булгаков', 490, 'Классика', 'Роман о дьяволе, явившемся в советскую Москву в 1930-е годы.'),
  ('Преступление и наказание', 'Фёдор Достоевский', 380, 'Классика', 'Роман о студенте Раскольникове, совершившем убийство.'),
  ('1984', 'Джордж Оруэлл', 420, 'Фантастика', 'Антиутопия о тоталитарном обществе будущего.'),
  ('Гарри Поттер и философский камень', 'Джоан Роулинг', 650, 'Фэнтези', 'Первая книга о молодом волшебнике Гарри Поттере.'),
  ('Три товарища', 'Эрих Мария Ремарк', 450, 'Роман', 'История дружбы и любви на фоне послевоенной Германии.'),
  ('Думай медленно... решай быстро', 'Даниэль Канеман', 720, 'Психология', 'Книга о двух системах мышления.'),
  ('Сапиенс', 'Юваль Ной Харари', 680, 'История', 'Краткая история человечества.'),
  ('Атомные привычки', 'Джеймс Клир', 560, 'Психология', 'Простой и проверенный способ выработать хорошие привычки.')
on conflict do nothing;
