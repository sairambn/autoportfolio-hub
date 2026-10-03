import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Code2,
  Download,
  FileText,
  Github,
  Globe,
  ImagePlus,
  Layers,
  Rocket,
  Sparkles,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Palette,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Folio — Build a portfolio from your resume in minutes" },
      {
        name: "description",
        content:
          "Upload your resume, pick a style, and get a stunning portfolio website deployed on GitHub Pages — completely free. No coding required.",
      },
      { property: "og:title", content: "Folio — Portfolio from your resume" },
      {
        property: "og:description",
        content: "Photo + resume → live portfolio website in minutes. Free on GitHub Pages.",
      },
    ],
  }),
  component: Landing,
});

const THEMES = [
  { id: "signal", label: "Signal", bg: "#f4f0e8", fg: "#1a1814", accent: "#c45c26", surface: "#e9e3d8" },
  { id: "midnight", label: "Midnight", bg: "#0b1220", fg: "#e8eef7", accent: "#7dd3fc", surface: "#151e2e" },
  { id: "neon", label: "Neon", bg: "#0e0e0e", fg: "#f4f1ea", accent: "#c6f432", surface: "#1a1a1a" },
  { id: "ocean", label: "Ocean", bg: "#eef6fb", fg: "#0f2744", accent: "#0284c7", surface: "#ddeff8" },
  { id: "campus", label: "Campus", bg: "#f3f7f0", fg: "#1c2b1a", accent: "#3f7d3a", surface: "#e4ecdf" },
  { id: "mono", label: "Mono", bg: "#0d1117", fg: "#c9d1d9", accent: "#3fb950", surface: "#161b22" },
  { id: "minimal", label: "Minimal", bg: "#ffffff", fg: "#111111", accent: "#2563eb", surface: "#f4f4f5" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "Resume → Portfolio",
    desc: "Upload a PDF or paste text. We extract your name, skills, experience, and projects automatically.",
  },
  {
    icon: Palette,
    title: "7 Professional Themes",
    desc: "Signal, Midnight, Neon, Ocean, Campus, Mono, Minimal. Each one crafted for a specific vibe and role.",
  },
  {
    icon: Github,
    title: "One-Click GitHub Deploy",
    desc: "Connects to your GitHub account and publishes a live site on GitHub Pages with a permanent URL.",
  },
  {
    icon: Download,
    title: "Download as HTML",
    desc: "Don't want a GitHub account? Download a single self-contained HTML file you can host anywhere.",
  },
  {
    icon: Code2,
    title: "GitHub Repos Section",
    desc: "Automatically pulls your public GitHub repos and displays them beautifully with star counts and languages.",
  },
  {
    icon: Shield,
    title: "100% Private",
    desc: "Nothing is stored on our servers. Your resume and data stay in your browser and your GitHub account.",
  },
];

const STEPS = [
  {
    icon: ImagePlus,
    n: "01",
    title: "Upload photo & resume",
    desc: "Drop a PDF resume and a profile photo. Our parser extracts everything automatically.",
  },
  {
    icon: Sparkles,
    n: "02",
    title: "Review & customize",
    desc: "Edit your details, pick a theme, rearrange sections, and see live changes in real time.",
  },
  {
    icon: Rocket,
    n: "03",
    title: "Deploy live",
    desc: "One click publishes a beautiful portfolio to a public GitHub Pages URL. Free forever.",
  },
];

const FAQS = [
  {
    q: "Do I need to know how to code?",
    a: "Not at all. Folio handles everything — resume parsing, HTML generation, and GitHub deployment. You just fill in the form and click.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Folio itself is free. GitHub Pages (where your site lives) is also free for public repos. No hidden costs.",
  },
  {
    q: "What if I don't have a GitHub account?",
    a: "No problem — you can still build and download your portfolio as a single HTML file and host it anywhere else.",
  },
  {
    q: "How long does it take?",
    a: "Most people have a live portfolio URL within 5 minutes of landing on the site. Resume parsing takes seconds.",
  },
  {
    q: "Can I edit my portfolio after publishing?",
    a: "Yes! Go to your Dashboard, open the editor, make changes, and republish. With Auto-push enabled, it saves and deploys on every edit.",
  },
  {
    q: "Is my data safe?",
    a: "Your resume is parsed locally in your browser and never sent to our servers. The only thing we write is to your own GitHub repository.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2 border-ink/10 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold"
      >
        {q}
        {open ? <ChevronUp className="size-4 shrink-0 text-primary" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

function ThemePreviewCard({ theme }: { theme: typeof THEMES[0] }) {
  return (
    <div
      className="rounded-xl overflow-hidden border-2 border-ink/10 shadow-sm transition hover:scale-[1.02] hover:shadow-md"
      style={{ background: theme.bg }}
    >
      {/* Mock nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: `${theme.fg}15` }}>
        <div className="w-16 h-2 rounded-full" style={{ background: theme.fg, opacity: 0.7 }} />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-2 rounded-full" style={{ background: theme.fg, opacity: 0.2 }} />
          ))}
        </div>
      </div>
      {/* Mock content */}
      <div className="px-4 py-5 space-y-3">
        <div className="w-3/4 h-4 rounded" style={{ background: theme.fg, opacity: 0.85 }} />
        <div className="w-1/2 h-2.5 rounded" style={{ background: theme.fg, opacity: 0.3 }} />
        <div className="w-full h-2 rounded" style={{ background: theme.fg, opacity: 0.15 }} />
        <div className="w-4/5 h-2 rounded" style={{ background: theme.fg, opacity: 0.15 }} />
        <div className="flex gap-2 mt-4">
          {[theme.accent, theme.surface, `${theme.fg}30`].map((c, i) => (
            <div key={i} className="h-6 rounded-full" style={{ background: c, width: `${48 + i * 12}px` }} />
          ))}
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="text-xs font-bold" style={{ color: theme.accent }}>{theme.label}</div>
      </div>
    </div>
  );
}

function Landing() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen grain">
      {/* ─── NAV ─── */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#themes" className="text-muted-foreground hover:text-foreground transition-colors">Themes</a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button variant="block" onClick={() => nav({ to: "/create" })}>
            Get started
          </Button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <header className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <div className="mb-6 flex flex-wrap gap-3">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-4 py-1.5 text-sm font-semibold">
            <Zap className="size-3.5" /> Free on GitHub Pages
          </span>
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border-2 border-ink/20 bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Star className="size-3.5" /> 7 premium themes
          </span>
        </div>

        <h1 className="animate-rise max-w-5xl text-6xl font-black leading-[0.92] tracking-tight md:text-8xl lg:text-9xl">
          Turn your resume into{" "}
          <em className="text-primary not-italic">a portfolio site.</em>
        </h1>

        <p className="animate-rise mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
          Upload a PDF resume and a photo. We parse everything, let you pick a style, and
          deploy a public portfolio URL on GitHub Pages — <strong>completely free</strong>.
        </p>

        <div className="animate-rise mt-10 flex flex-wrap items-center gap-4">
          <Button variant="block" size="lg" onClick={() => nav({ to: "/create" })}>
            Build my portfolio <ArrowRight />
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to="/auth">
              <Github className="size-4" /> Sign in with GitHub
            </Link>
          </Button>
        </div>

        <div className="animate-rise mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {["No account needed to start", "Free GitHub Pages hosting", "Download HTML anytime"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <CheckCircle className="size-4 text-primary" /> {t}
            </span>
          ))}
        </div>
      </header>

      {/* ─── THEMES PREVIEW ─── */}
      <section id="themes" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Layers className="size-4" /> 7 themes
        </div>
        <h2 className="mb-10 text-4xl font-black leading-tight">
          A style for every personality.
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {THEMES.map((t) => (
            <ThemePreviewCard key={t.id} theme={t} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="block" onClick={() => nav({ to: "/create" })}>
            Try all themes <ArrowRight />
          </Button>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-4" /> How it works
        </div>
        <h2 className="mb-12 max-w-lg text-4xl font-black leading-tight">
          From zero to live in under 5 minutes.
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, n, title, desc }) => (
            <div key={n} className="block-card p-8">
              <div className="mb-5 flex items-start justify-between">
                <div className="grid size-12 place-items-center rounded-xl bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <span className="font-display text-4xl font-black text-ink/10">{n}</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Globe className="size-4" /> Features
        </div>
        <h2 className="mb-12 max-w-lg text-4xl font-black leading-tight">
          Everything you need. Nothing you don't.
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="block-card p-6">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-accent">
                <Icon className="size-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMPARISON / BENEFITS STRIP ─── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="block-card overflow-hidden p-0">
          <div className="grid md:grid-cols-2">
            <div className="bg-ink p-10 text-paper">
              <h3 className="mb-6 font-display text-2xl font-black">Before Folio</h3>
              <ul className="space-y-3 text-paper/60">
                {[
                  "Hours designing from scratch",
                  "Hiring a developer",
                  "Learning HTML & CSS",
                  "Paying monthly for a portfolio builder",
                  "Copy-pasting resume into forms",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 line-through">
                    <span className="text-red-400">✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-accent p-10">
              <h3 className="mb-6 font-display text-2xl font-black">After Folio</h3>
              <ul className="space-y-3">
                {[
                  "Resume parsed in seconds",
                  "Live site in under 5 minutes",
                  "No code, no design skills needed",
                  "Free GitHub Pages hosting",
                  "Download HTML for any host",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 font-medium">
                    <span className="text-green-700">✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 pb-24">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          FAQ
        </div>
        <h2 className="mb-10 text-4xl font-black">Common questions.</h2>
        <div className="block-card p-8">
          {FAQS.map((f) => (
            <FAQItem key={f.q} {...f} />
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="block-card bg-ink p-12 text-center text-paper">
          <h2 className="font-display text-5xl font-black italic md:text-6xl">
            Ready to stand out?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-paper/70">
            Upload your resume now and have a live portfolio URL in under 5 minutes. No credit card, no coding.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-accent text-ink hover:bg-accent/90 border-2 border-accent"
              onClick={() => nav({ to: "/create" })}
            >
              Build my portfolio <ArrowRight />
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-paper hover:text-paper hover:bg-paper/10">
              <Link to="/auth">
                <Github className="size-4" /> Sign in
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t-2 border-ink/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="font-display text-xl font-black italic">
            Folio.
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Folio. Built with React & TanStack Start.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/create" className="hover:text-foreground transition-colors">Create</Link>
            <a
              href="https://github.com/sairambn/autoportfolio-hub"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
