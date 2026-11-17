# Notes for coding agents

Read `README.md` first: it documents the features, environment variables, database migrations,
Telegram setup, the Vercel deployment, and the change history.

## Working rules

- Chat with the owner in Ukrainian. Code, comments, commit messages, and docs in English.
  UI strings go into the i18n dictionaries, never inline.
- Pushing to `main` deploys to production on Vercel. Ask before pushing.
- A change that needs a new column or table ships with a new numbered file in `supabase/migrations/`.
  The owner runs it in the Supabase SQL Editor; push the code only after they confirm it ran.
- New UI text: add the key to `src/lib/i18n/dictionaries/ru.ts`, then `uk.ts` and `en.ts`
  (the type check fails if one is missing).
- After changes run `npx tsc --noEmit` and `npm run build` (with dummy `NEXT_PUBLIC_SUPABASE_URL`
  and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if there is no `.env.local`). `npm run lint` has no config yet.
- Check a deploy with `gh api repos/AndrianAD/bookstore/commits/<sha>/status`, then fetch
  https://bookstore-kappa-self.vercel.app.

## Things that are easy to get wrong

- Genres are stored as Russian strings in the database; translate them with `genreLabel()`.
- Rows created before a migration may lack a column; use `conditionOf()`, `stockOf()`, and
  `currencySymbol()` instead of reading the fields directly.
- Dictionaries contain functions, so pass only the locale to client components (`I18nProvider`),
  never the dictionary itself.
- The Telegram webhook secret is derived from the bot token (`webhookSecret()`); changing the token
  requires pressing "Update Telegram" in the admin panel to register the webhook again.
- Closed off-canvas panels must render inside `Drawer`, which clips them; a bare `translate-x-full`
  panel widens the page on phones.
