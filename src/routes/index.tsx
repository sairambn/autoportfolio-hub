import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Download, Github, Palette, Rows3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureGuestSession } from "@/lib/auth";
import { createPortfolio } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Folio — Build a portfolio in minutes" },
      {
        name: "description",
        content:
          "No account needed. Design your portfolio, download a single HTML file, or publish to GitHub Pages.",
      },
      { property: "og:title", content: "Folio — Build a portfolio in minutes" },
      {
        property: "og:description",
        content: "Templates, colors, sections. Download HTML or publish to GitHub.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const nav = useNavigate();

  function startNow() {
    const session = ensureGuestSession();
    const p = createPortfolio(session.user.login, { title: "My Portfolio" });
    // Prefer a friendly blank slate for guests
    if (session.user.login === "guest") {
      // storage already set name from login; editor can refine
    }
    nav({ to: "/editor/$id", params: { id: p.id } });
  }

  return (
    <div className="min-h-screen grain">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <div className="flex gap-3">
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button variant="block" onClick={startNow}>
            Start free
          </Button>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <p className="animate-rise mb-6 inline-block rounded-full border-2 border-ink bg-accent px-4 py-1 text-sm font-semibold">
          No account required
        </p>
        <h1 className="animate-rise max-w-4xl text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
          Build your portfolio. <em className="text-primary">Download the file.</em>
        </h1>
        <p className="animate-rise mt-8 max-w-xl text-lg text-muted-foreground">
          Fill in your name, projects, and skills. Get one HTML file you can open anywhere — email it,
          host it, or drop it on GitHub Pages. Optional sign-in only if you want auto-publish.
        </p>
        <div className="animate-rise mt-10 flex flex-wrap gap-4">
          <Button variant="block" size="lg" onClick={startNow}>
            Build now <ArrowRight />
          </Button>
          <Button asChild variant="blockOutline" size="lg">
            <Link to="/auth">I have GitHub</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: Zap,
            t: "Start in 10 seconds",
            d: "No signup form. Click Build now and edit immediately.",
          },
          {
            icon: Download,
            t: "One-file download",
            d: "Export a complete index.html with your design baked in.",
          },
          {
            icon: Github,
            t: "Optional GitHub Pages",
            d: "Later, sign in once to push a live URL — only if you want.",
          },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="block-card p-6">
            <I className="mb-4 size-7 text-primary" />
            <h3 className="text-2xl font-bold">{t}</h3>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="block-card flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black">How people use Folio</h2>
            <p className="mt-1 text-muted-foreground">
              1) Edit → 2) Download HTML → 3) Upload anywhere (or publish to GitHub).
            </p>
          </div>
          <Button variant="block" onClick={startNow}>
            Try it free
          </Button>
        </div>
      </section>
    </div>
  );
}
