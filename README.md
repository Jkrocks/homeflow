# HomeFlow

**Know where your money goes. Run your home with confidence.**

HomeFlow is a free, friendly household notebook for families: monthly money, daily expenses, bills, a monthly plan, to-dos, a shopping list, savings goals and a calendar. It is built for homemakers, parents, students and first-time budgeters, not accountants.

## What's inside

- **Dashboard**: money in, money out, what's left and how much you can spend per day for the rest of the month
- **Quick add**: a floating + button, or just type "Spent 450 on vegetables today"
- **My Bills**: repeating bills with due dates, paid/unpaid and reminders
- **My Month**: optional spending limits per category, planned vs spent, a 6-month chart
- **Expense History**: search and filter by category, date and amount
- **To-do & Shopping**, **My Goals**, **Calendar**, **Our Family**
- **Shared household**: family members sign in with an email link and join with a code; changes sync live
- **Demo mode**: try it without an account; demo data stays in your browser

## Tech

A single static page (`index.html`) hosted on GitHub Pages, with [Supabase](https://supabase.com) for sign-in, storage and live sync.

## Set up your own copy

1. Create a Supabase project. In **SQL Editor**, run `supabase/schema.sql`.
2. In **Authentication → URL Configuration**, set the Site URL to your GitHub Pages address (for example `https://<user>.github.io/homeflow/`) and add it to Redirect URLs.
3. Copy your project URL and anon key from **Project Settings → API** into `config.js`.
4. In the GitHub repo, go to **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.

Without `config.js` values, HomeFlow runs in demo mode only.

## Security

- Every table uses row-level security: a household's data is readable and writable only by its members. Signed-out visitors get nothing.
- Sign-in is by emailed link (PKCE flow); there are no passwords to leak.
- Join codes are 8 characters, limited to 10 guesses per person per hour, and can be replaced from Settings.
- Deletions sync as tombstones so realtime never broadcasts another household's row keys; `purge_deleted_items()` clears them after 30 days.
- The page ships a strict Content-Security-Policy: scripts only from this site (Supabase's library is self-hosted in `vendor/`), network calls only to this project's Supabase. It refuses to run inside frames.
- Everything read from the database is validated and escaped before it is shown.
- The publishable key in `config.js` is meant to be public. Never put a secret or service_role key in this repo.

Run `supabase/schema.sql`, then `supabase/security.sql`.
