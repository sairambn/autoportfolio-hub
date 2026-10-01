# Portfolio Website Builder

A multi-user app where anyone signs up, builds a portfolio in a live editor, connects their own GitHub, and has their repos shown on the portfolio and the site published to a GitHub repo automatically.

## What users get
- **Sign up / log in** (email + Google).
- **Dashboard**: list of their portfolios, create new.
- **Editor** (split view: settings panel + live preview):
  - Content: name, headline, bio, avatar, skills, projects, experience, contact links.
  - Themes: 4 starter templates, color palette picker, font pair picker.
  - Sections: add, remove, reorder (Hero, About, Skills, Projects, GitHub Repos, Experience, Contact).
  - Autosave.
- **Public page** at `/p/<username>` with its own share title/description.
- **GitHub connection** (each user connects their own account):
  - "GitHub Repos" section auto-fills from their public repos (pinned/top-starred, refreshed on view).
  - "Publish to GitHub": pick or create a repo; the portfolio is exported as a static `index.html` and committed. Optional auto-push on every save. Works with GitHub Pages.

## Build order
1. Design system + landing page.
2. Enable Lovable Cloud: auth, portfolios table, avatar storage.
3. Editor with content, themes, sections, live preview, public page.
4. GitHub per-user connection, repo import, publish/auto-push.

## Technical details
- Tables: `profiles` (username), `portfolios` (user_id, slug, theme jsonb, sections jsonb, content jsonb, github_repo, auto_push), RLS by owner; public read of published portfolios.
- Per-user GitHub via App User Connector (each user authorizes their own GitHub); server functions call GitHub API for repo listing and the Contents API (`PUT /repos/{owner}/{repo}/contents/index.html`) to commit.
- Static export: server renders the portfolio to a self-contained HTML string using the same theme tokens.
- Reorder via dnd-kit.
