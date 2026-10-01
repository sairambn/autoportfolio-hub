import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Github, Palette, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Folio — Build your portfolio, ship it to GitHub" },
      { name: "description", content: "Design a custom portfolio in minutes. Your GitHub repos show up automatically and every change is pushed to your repo." },
      { property: "og:title", content: "Folio — Build your portfolio, ship it to GitHub" },
      { property: "og:description", content: "Custom themes, drag-and-drop sections, and automatic GitHub publishing." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen grain">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">Folio.</Link>
        <div className="flex gap-3">
          <Button asChild variant="ghost"><Link to="/auth">Log in</Link></Button>
          <Button asChild variant="block"><Link to="/auth">Start free</Link></Button>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <p className="animate-rise mb-6 inline-block rounded-full border-2 border-ink bg-accent px-4 py-1 text-sm font-semibold">
          Portfolio builder · GitHub-native
        </p>
        <h1 className="animate-rise max-w-4xl text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
          Your work, <em className="text-primary">set in type</em> and shipped to GitHub.
        </h1>
        <p className="animate-rise mt-8 max-w-xl text-lg text-muted-foreground">
          Pick a template, tune the colors and fonts, arrange your sections. Your repos appear on their own, and every save can push straight to your GitHub repo.
        </p>
        <div className="animate-rise mt-10 flex gap-4">
          <Button asChild variant="block" size="lg"><Link to="/auth">Build my portfolio <ArrowRight /></Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          { icon: Palette, t: "Make it yours", d: "Four templates, any palette, five font pairings." },
          { icon: Rows3, t: "Arrange freely", d: "Drag sections into order, hide what you don't need." },
          { icon: Github, t: "Auto-sync GitHub", d: "Repos pulled in live. Site pushed to your repo and GitHub Pages." },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="block-card p-6">
            <I className="mb-4 size-7 text-primary" />
            <h3 className="text-2xl font-bold">{t}</h3>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
