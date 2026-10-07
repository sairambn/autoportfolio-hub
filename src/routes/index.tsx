import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, FileText, ImagePlus, LayoutDashboard, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSession, type AuthSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Folio — Portfolio from your resume in minutes" },
      {
        name: "description",
        content: "Enter details, upload photo and resume, get a portfolio website deployed online.",
      },
      { property: "og:title", content: "Folio — Portfolio from your resume" },
      {
        property: "og:description",
        content: "Photo + resume → live portfolio website.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const nav = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  const hasAccount = session && session.user.login !== "guest" && session.token;

  return (
    <div className="min-h-screen grain">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <div className="flex items-center gap-3">
          {hasAccount ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button variant="block" onClick={() => nav({ to: "/create" })}>
                Create portfolio
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button variant="block" onClick={() => nav({ to: "/create" })}>
                Create portfolio
              </Button>
            </>
          )}
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <p className="animate-rise mb-6 inline-block rounded-full border-2 border-ink bg-accent px-4 py-1 text-sm font-semibold">
          Photo + resume → live website
        </p>
        <h1 className="animate-rise max-w-4xl text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
          Enter your details. <em className="text-primary">Get a portfolio site.</em>
        </h1>
        <p className="animate-rise mt-8 max-w-xl text-lg text-muted-foreground">
          Upload a photo and resume, review the auto-filled profile, pick a style, and deploy a
          public portfolio URL — free on GitHub Pages.
        </p>
        <div className="animate-rise mt-10 flex flex-wrap gap-4">
          <Button variant="block" size="lg" onClick={() => nav({ to: "/create" })}>
            Start now <ArrowRight />
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: ImagePlus,
            t: "1. Photo + resume",
            d: "Upload a picture and paste or upload your resume text.",
          },
          {
            icon: FileText,
            t: "2. We build it",
            d: "Name, skills, experience and projects are filled in automatically.",
          },
          {
            icon: Rocket,
            t: "3. Deploy live",
            d: "One step publishes a public website URL you can share.",
          },
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
