# Folio — AutoPortfolio Hub

Build a custom portfolio in the browser, pull in your public GitHub repos, and publish a static site to your own GitHub repo (GitHub Pages ready).

## What you get

- Sign up / log in (email or Google)
- Dashboard to create and manage portfolios
- Live editor: content, themes (4 templates + palette + fonts), drag-and-drop sections, autosave
- Public page at `/p/<slug>`
- GitHub username → live public repos on the portfolio
- Optional: connect your GitHub, publish `index.html` to a repo, enable Pages

## Stack

- TanStack Start + React 19 + TypeScript
- Tailwind CSS v4 + shadcn-style UI
- Supabase (auth + portfolios table)
- dnd-kit for section reorder
- Lovable App User Connector for per-user GitHub OAuth

## Local development

```sh
git clone <this-repo>
cd autoportfolio-hub
npm i   # or bun install
npm run dev
```

Needs Node 18+. Copy env vars from your Lovable / Supabase project (see `.env`).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/auth` | Sign in / sign up |
| `/dashboard` | Your portfolios |
| `/editor/$id` | Full editor + live preview |
| `/p/$slug` | Public portfolio |
| `/oauth/github/return` | GitHub OAuth popup return |

## Built with Lovable

Continue in the [Lovable editor](https://lovable.dev/projects/18dea81b-0ad0-42c3-8074-766015dc42a1). Changes on `main` sync both ways.
