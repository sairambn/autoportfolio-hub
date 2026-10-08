# Folio — Portfolio Builder

Build a portfolio in the browser, save drafts locally and in Cloud Firestore, and publish a static site to **your** GitHub repo + Pages.

**Firebase Auth + Cloud Firestore + GitHub Integration.** Works seamlessly for thousands of users with real-time sync and direct static publishing.

**Live:** [portfoliobuilder-three.vercel.app](https://portfoliobuilder-three.vercel.app)

## How it works

1. Sign in with GitHub (OAuth App)
2. Edit portfolio in the browser (drafts in localStorage)
3. Publish → creates/updates a public repo with `index.html` (+ `folio.json`) and turns on GitHub Pages

## Routes

| Path               | Purpose                      |
| ------------------ | ---------------------------- |
| `/`                | Landing                      |
| `/auth`            | Sign in with GitHub          |
| `/auth/callback`   | OAuth return                 |
| `/api/auth/github` | OAuth start + token exchange |
| `/dashboard`       | Local portfolios             |
| `/editor/$id`      | Editor + publish             |
| `/p/$slug`         | Same-browser preview         |

## Stack

- TanStack Start (React 19 + SSR)
- Tailwind CSS v4
- GitHub OAuth + GitHub API (client-side publish)
- localStorage for drafts

## Setup

### 1. GitHub OAuth App

1. https://github.com/settings/developers → **New OAuth App**
2. Homepage: your Vercel URL
3. Callback: `https://YOUR_DOMAIN/api/auth/github`
4. Copy Client ID + Client Secret

### 2. Env on Vercel

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 3. Local

```sh
cp .env.example .env
# fill GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET
npm install
npm run dev
```

## Capacity (~2k users)

Fine on Vercel free/hobby. Cost is mostly OAuth traffic; portfolio data never hits your servers.

## Notes

- Clearing site data / another browser = drafts gone until you publish again
- `folio.json` in the repo is a backup of the last publish
- Public live URL is always `https://USERNAME.github.io/REPO/`
