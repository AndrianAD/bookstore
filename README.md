# Bookstore («Книжковий світ»)

An online bookstore: a public catalog with a cart and phone-callback orders, an admin panel,
and a Telegram integration (a catalog channel, order notifications, and ordering through a bot).

Stack: Next.js 14 (App Router) · React 18 · Tailwind CSS · Supabase (Postgres, Auth, Storage) ·
Telegram Bot API · hosted on Vercel.

This file is the single source of truth for rebuilding the project from scratch: database,
Telegram, and the Vercel deployment.

---

## Where everything lives

| What | Where |
|------|-------|
| Code | GitHub [`AndrianAD/bookstore`](https://github.com/AndrianAD/bookstore), branch `main` |
| Production site | https://bookstore-kappa-self.vercel.app |
| Hosting | Vercel project `bookstore` in team `andrianads-projects`, connected to the GitHub repo |
| Database, auth, images | A Supabase project (URL and keys are in the Vercel environment variables) |
| Telegram | One bot (token in `TELEGRAM_BOT_TOKEN`) and one channel (`TELEGRAM_CHANNEL_ID`) |

Every push to `main` triggers a production build on Vercel. There is no other deploy step.

---

## Features

**Storefront**
- Catalog with search by title or author, filters by condition (new / used) and genre, and sorting.
- On phones the filters open from a "Filters" button as a left drawer, so the catalog is visible first.
- Book page with description, details, and similar books.
- Cart stored in the browser (`localStorage`), capped by the book's stock.
- "Buy in one click": the customer leaves a phone number, the order is saved and the shop
  is notified in Telegram.

**Books**
- Price in euros or hryvnias, chosen per book (no conversion). Totals are summed per currency,
  e.g. `120 € + 500 ₴`.
- Condition: new or used.
- Stock (number of copies). At 0 the book shows as "Sold", cannot be added to the cart,
  and its Telegram channel post is removed; it is posted again once stock is above 0.

**Languages**
- Ukrainian, Russian, and English UI. The admin chooses one language for the whole site
  (admin sidebar → "Site language"; on phones it is at the top of the Books page).
  It applies to the storefront, the admin panel, channel posts, bot replies, and order notifications.
- Book titles and descriptions are not translated; they are shown as entered.
- Genres are stored in Russian in the database (`GENRES` in `src/lib/types.ts`) and translated for display.

**Admin panel** (`/admin`, sign-in at `/admin/login`)
- Add, edit, and delete books; upload covers to Supabase Storage.
- Orders list with statuses: new → called back → completed / cancelled.
- "Update Telegram" button: publishes or refreshes every book in the channel and (re)registers
  the bot webhook.

**Telegram**
- Channel: one post per in-stock book (cover, title, author, genre, condition, price, description)
  with an "Order" button. Posts are created, edited, and deleted automatically when a book changes.
  The channel posts have no link to the website; the site link belongs in the channel description.
- Bot: the "Order" button opens a private chat with the bot (`t.me/<bot>?start=book_<id>`).
  The bot shows the book and asks for a phone number (contact button or typed). It then saves
  the order and notifies the shop chat. The customer's Telegram `@username` is stored with the order.
- Order notifications: every order (website or bot) is sent to the chats in `TELEGRAM_CHAT_ID`.

---

## Environment variables

Set all of them in Vercel → project → **Settings** → **Environment Variables** (Production).
A change takes effect only after a new deployment (push to `main`, or **Deployments** → **⋯** → **Redeploy**).
For local development copy `.env.local.example` to `.env.local`.

| Variable | Required | Used for |
|----------|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public Supabase key (browser and server, respects row level security) |
| `SUPABASE_SERVICE_ROLE_KEY` | for the bot | Server-only key; the Telegram webhook uses it to read books, store bot sessions, and create orders |
| `TELEGRAM_BOT_TOKEN` | for Telegram | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | for notifications | Chat id(s) that receive new orders, comma-separated |
| `TELEGRAM_CHANNEL_ID` | for the channel | `@channel_username` or the numeric id `-100…` (the numeric id survives renaming the channel) |

Without the Telegram variables the site still works; Telegram features are simply skipped.

---

## Rebuilding from scratch

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com). Copy the Project URL, the `anon` key,
   and the `service_role` key (Project Settings → API).
2. Open **SQL Editor** and run every file in `supabase/migrations/` **in this order**, one at a time:

   | Order | File | What it does |
   |-------|------|--------------|
   | 1 | `init.sql` | `books` table, RLS, the `books-images` storage bucket, 8 demo books |
   | 2 | `02_orders.sql` | `orders` table and RLS (anyone can create, only signed-in users can read) |
   | 3 | `03_telegram_channel.sql` | `books.telegram_message_id` (the book's channel post) |
   | 4 | `04_book_condition.sql` | `books.condition` (`new` / `used`) |
   | 5 | `05_book_currency.sql` | `books.currency` (`EUR` / `UAH`) |
   | 6 | `06_site_settings.sql` | `site_settings` table with the site language |
   | 7 | `07_book_stock.sql` | `books.stock` (copies in stock, default 1) |
   | 8 | `08_bot_orders.sql` | `orders.customer_telegram` and the `bot_sessions` table |

   To skip the demo books on a real restore, delete the `insert into public.books …` block at the
   end of `init.sql` before running it.

   If the site later reports *"Could not find the table … in the schema cache"*, run
   `notify pgrst, 'reload schema';` in the SQL Editor.
3. Create the admin user: **Authentication** → **Users** → **Add user** → **Create new user**,
   with **Auto Confirm User** on.
4. Turn off public sign-up: **Authentication** → **Sign In / Providers** → disable
   "Allow new users to sign up". **Every Supabase user is an admin** in this app, so this is required.

**Restoring data.** Migrations only create the schema. To move real data, use Supabase backups
(Database → Backups) or export the `books`, `orders`, and `site_settings` tables as CSV and import them.
Cover images live in the `books-images` storage bucket and must be copied separately.

**Forgotten admin password** (run in SQL Editor):

```sql
update auth.users
set encrypted_password = crypt('NEW_PASSWORD', gen_salt('bf'))
where email = 'admin@example.com';
```

### 2. Telegram

1. Create a bot with [@BotFather](https://t.me/BotFather) (`/newbot`) and copy the token.
   The display name can be changed later with `/setname`; the `@username` cannot.
2. Create the channel and add the bot as an **administrator** allowed to post, edit, and delete messages.
3. Find the chat id for order notifications: write to the bot from the account that should get
   orders, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and take `message.chat.id`.
   For a group, add the bot to it and do the same.
4. Put the channel description with the link to the website (posts no longer link to the site).

### 3. Vercel

1. In Vercel: **Add New** → **Project** → import `AndrianAD/bookstore`. Framework: Next.js, no overrides.
2. Add all environment variables from the table above.
3. Deploy. The site is live at the project's `*.vercel.app` domain.
   If a deployment URL shows `DEPLOYMENT_NOT_FOUND`, the project has no production build:
   push any commit to `main` (an empty commit is enough) to trigger one.

### 4. Connect the channel and the bot

1. Sign in at `/admin/login`, choose the site language in the sidebar.
2. Press **Update Telegram** on the Books page. This:
   - registers the bot webhook at `<site>/api/telegram-webhook` (needed for ordering through the bot);
   - posts every in-stock book to the channel, or refreshes existing posts.

   Press it again after changing the site language, the domain, or the bot.
3. Check: tap **Order** under a channel post → the bot should answer with the book and a
   "Send my number" button.

---

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the values
npm run dev                        # http://localhost:3000
npx tsc --noEmit                   # type check
npm run build                      # production build, same as Vercel
```

`npm run lint` does not work yet: the project has no ESLint configuration.
The Telegram webhook cannot reach `localhost`, so the bot is only testable on a deployed site.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Catalog (/)
│   ├── book/[id]/page.tsx          # Book page
│   ├── layout.tsx                  # Reads the site language, wraps the app in I18nProvider
│   ├── admin/                      # Admin: books (page.tsx), orders/, login/
│   └── api/
│       ├── notify-order/           # Website order → Telegram notification
│       ├── telegram-channel/       # Admin-only: publish / unpublish / publish_all + webhook setup
│       └── telegram-webhook/       # Telegram → bot (verified by a secret derived from the bot token)
├── components/                     # UI; Drawer.tsx is shared by the cart and the mobile filters
├── lib/
│   ├── types.ts                    # Book, Order, CartItem, genres, condition and stock helpers
│   ├── money.ts                    # Currencies, price formatting, per-currency totals
│   ├── cart.ts                     # Browser cart (localStorage), capped by stock
│   ├── use-catalog-filters.ts      # Filter state in the URL (condition, genre)
│   ├── i18n/                       # Locales, typed dictionaries (ru is the reference), server/client access
│   ├── settings/site-settings.ts   # Read/save the site language
│   ├── books/                      # BookRepository + BookChannelSync (channel post per book)
│   ├── orders/                     # OrderRepository + OrderNotifier (shop chat alerts)
│   ├── telegram/                   # Bot API client, channel publisher, post/message rendering, OrderBot
│   └── supabase/                   # Browser, server (cookie session), and admin (service role) clients
└── middleware.ts                   # Redirects /admin/* to /admin/login without a session
supabase/migrations/                # SQL to run in order (see above)
```

Conventions:
- All UI text comes from `src/lib/i18n/dictionaries/{ru,uk,en}.ts`. `ru.ts` defines the shape;
  a missing key in `uk` or `en` fails the type check.
- Telegram and database access go through small interfaces (`BookRepository`, `PostPublisher`,
  `OrderRepository`, `BotSessionStore`) so the logic in `BookChannelSync` and `OrderBot` does not
  depend on Supabase or the Bot API directly.
- Schema changes are new numbered files in `supabase/migrations/`. Run the SQL in Supabase
  **before** pushing code that uses it, or the live site breaks until it is applied.

---

## Known limitations and ideas

- Every Supabase Auth user is an admin; there is no admin role. Keep sign-up disabled.
- Website orders send prices from the browser; they are not recalculated on the server.
- `/api/notify-order` and order creation have no rate limit or captcha.
- Next.js 14.2.29 has a published security advisory; upgrade to a patched release.
- Sorting by price compares numbers only, so 100 ₴ sorts above 50 €.
- `orders.total` is a plain sum across currencies; the UI computes per-currency totals from items instead.
- Stock is not decreased automatically when an order is placed; the admin edits it.
- No pagination: the catalog loads every book.
- No ESLint config and no tests.

---

## Change history

**May 2026 — initial build.** Catalog with search, filters, and sorting; admin panel with book CRUD
and cover upload; book page; cart and one-click orders; order management; Telegram order notifications.
Deployed to Vercel.

**November 2026**
- **Production restored.** The Vercel project still existed but had no production deployment
  (`DEPLOYMENT_NOT_FOUND`); an empty commit to `main` rebuilt it.
- **Telegram channel sync.** One channel post per book, kept in sync from the admin panel.
  Telegram code was refactored into a shared client, publisher, and repositories (migration 03).
- **New / used condition** with a catalog filter (migration 04).
- **Per-book currency** (€ or ₴) with per-currency totals in the cart, orders, and notifications (migration 05).
- **Ukrainian, Russian, and English UI** with a site-wide language chosen by the admin (migration 06).
- **Filters trimmed.** Author and price-range filters removed; search now matches the author too.
- **Mobile filters drawer.** Filters open from a button on phones. The cart drawer no longer makes
  the page scroll sideways on phones.
- **Stock and ordering through the bot.** Book quantity with "Sold" state and automatic removal of the
  channel post at 0; the channel "Order" button opens the bot, which takes the phone number and creates
  the order (migrations 07 and 08).
- **Mobile-first redesign.** The hero banner is gone; search lives in a compact sticky header
  (`SiteHeader`) shared by the catalog and book pages. Genres are a swipeable chip row on phones,
  cards are lighter (hairline border, badges only for used or sold books, round cart button),
  and Inter is loaded through `next/font` with Cyrillic. Tailwind now also scans `src/lib`,
  where shared class maps such as `genre-style.ts` live.
