# Folio — AutoPortfolio Hub

> Build a beautiful portfolio in your browser, pull in your GitHub repos automatically, and publish a static site to GitHub Pages — all in one app.

**Live demo:** [portfoliobuilder-three.vercel.app](https://portfoliobuilder-three.vercel.app)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | Email/password + Google sign-in (via Supabase) |
| 🎨 4 Templates | Editorial, Minimal, Bold, Terminal |
| 🎨 Custom palettes | Pick any bg/fg/accent colours |
| 🔤 5 Font pairs | Fraunces, Playfair, Syne, DM Serif, JetBrains Mono |
| 🗂️ Drag-and-drop sections | Hero, About, Skills, Projects, GitHub Repos, Experience, Contact |
| 💾 Autosave | Changes saved automatically every 2 seconds |
| 🌐 Public URL | Each portfolio lives at `/p/<slug>` |
| 🐙 GitHub Repos | Pull public repos live via GitHub username (no auth needed) |
| 🚀 Publish to GitHub | Connect GitHub, push `index.html` to a repo, enable GitHub Pages |

---

## 🗺 Routes

| Path | Purpose |
|---|---|
| `/` | Landing page |
| `/auth` | Sign in / sign up |
| `/dashboard` | Your portfolios list |
| `/editor/$id` | Live editor + preview |
| `/p/$slug` | Public portfolio page |
| `/oauth/github/return` | GitHub OAuth popup return handler |

---

## 🛠 Stack

- **[TanStack Start](https://tanstack.com/start)** — React 19 + SSR routing
- **[Tailwind CSS v4](https://tailwindcss.com)** + shadcn-style UI components
- **[Supabase](https://supabase.com)** — Auth (email + Google) + Postgres DB
- **[dnd-kit](https://dndkit.com)** — Drag-and-drop section reorder
- **[Lovable App User Connector](https://lovable.dev)** — Per-user GitHub OAuth (optional)

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+ (or Bun)
- A [Supabase](https://supabase.com) project

### Steps

```sh
# 1. Clone
git clone https://github.com/sairambn/autoportfolio-hub.git
cd autoportfolio-hub

# 2. Install dependencies
npm install   # or: bun install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase URL, keys etc. (see .env.example for details)

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy to Vercel

### 1. Push to GitHub (already done ✅)

### 2. Import on Vercel
- Go to [vercel.com/new](https://vercel.com/new)
- Import your `autoportfolio-hub` repo
- Framework preset: **Other** (or Vite)

### 3. Add Environment Variables
In **Vercel → Project Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_URL` | Same as above |
| `SUPABASE_PROJECT_ID` | Your project ID |
| `VITE_SUPABASE_PROJECT_ID` | Same as above |
| `SUPABASE_PUBLISHABLE_KEY` | Your anon/publishable key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key (server only) |

### 4. Enable Google Sign-in (optional)
1. Go to **Supabase Dashboard → Authentication → Providers → Google**
2. Enable Google, paste your Google OAuth Client ID & Secret
3. In Google Cloud Console, add this to Authorized Redirect URIs:
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```

---

## 🗄 Database Schema

The app uses two Supabase tables:

### `portfolios`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to auth.users |
| `slug` | text | Unique public URL slug |
| `title` | text | Portfolio name |
| `content` | jsonb | Name, bio, skills, projects, etc. |
| `theme` | jsonb | Template, palette, font |
| `sections` | jsonb | Ordered section list with visibility |
| `published` | boolean | Whether public URL is active |
| `github_repo` | text | Connected GitHub repo name |
| `auto_push` | boolean | Push to GitHub on every save |
| `last_pushed_at` | timestamptz | Last GitHub push time |

### `app_user_connections`
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK to auth.users |
| `connector_id` | text | e.g. `"github"` |
| `connection_key_ciphertext` | text | AES-256-GCM encrypted API key |
| `github_login` | text | GitHub username |

---

## 🧑‍💻 Development Scripts

```sh
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint check
npm run format    # Prettier format
```

---

## 🤝 Contributing

Pull requests welcome! Please open an issue first for major changes.

---

Built with ❤️ using [Lovable](https://lovable.dev) · Continue editing at [lovable.dev/projects/18dea81b-0ad0-42c3-8074-766015dc42a1](https://lovable.dev/projects/18dea81b-0ad0-42c3-8074-766015dc42a1)
