import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CyberSecurityCenter } from "@/components/CyberSecurityCenter";
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
    <div className="min-h-screen grain overflow-x-hidden">
      {/* Responsive Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <CyberSecurityCenter triggerText="Security Shield" />
          {hasAccount ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                <Link to="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button
                variant="block"
                size="sm"
                onClick={() => nav({ to: "/create" })}
                className="text-xs sm:text-sm"
              >
                Create portfolio
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button
                variant="block"
                size="sm"
                onClick={() => nav({ to: "/create" })}
                className="text-xs sm:text-sm"
              >
                Create portfolio
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section - Mobile & Computer Scaling */}
      <header className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 pt-10 sm:pb-20 sm:pt-16">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <p className="animate-rise inline-block rounded-full border-2 border-ink bg-accent px-3.5 py-1 text-xs sm:text-sm font-semibold">
            Photo + resume → live website
          </p>
          <span className="animate-rise inline-flex items-center gap-1 rounded-full border-2 border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="size-3.5" /> Lifelong Free Gemini AI
          </span>
          <span className="animate-rise inline-flex items-center gap-1 rounded-full border-2 border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Building2 className="size-3.5" /> Career Roadmap & Executive Analytics
          </span>
        </div>

        <h1 className="animate-rise max-w-4xl text-4xl sm:text-6xl md:text-8xl font-black leading-[0.98] sm:leading-[0.95] tracking-tight">
          Enter your details.{" "}
          <em className="text-primary block sm:inline">Get a portfolio site.</em>
        </h1>
        <p className="animate-rise mt-6 sm:mt-8 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          Upload a photo and resume, review the auto-filled profile, pick a style, and deploy a
          public portfolio URL — complete with year-wise engineering roadmap & executive portfolio
          analytics.
        </p>

        <div className="animate-rise mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <Button
            variant="block"
            size="lg"
            onClick={() => nav({ to: "/create" })}
            className="w-full sm:w-auto font-bold"
          >
            Start now <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-ink font-bold w-full sm:w-auto"
            onClick={() => nav({ to: "/dashboard" })}
          >
            <FileSpreadsheet className="mr-2 size-5 text-primary" />
            Google & Product Prep Roadmap
          </Button>
        </div>
      </header>

      {/* Feature Grid - Responsive Spacing */}
      <section className="mx-auto grid max-w-6xl gap-4 sm:gap-6 px-4 sm:px-6 pb-20 sm:pb-24 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          {
            icon: Building2,
            t: "4. Roadmap & Google Sheets",
            d: "Year-wise milestone tracker by departments with live Google Sheets sync & talent directory.",
          },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="block-card p-5 sm:p-6 transition-all hover:-translate-y-1">
            <I className="mb-3 sm:mb-4 size-6 sm:size-7 text-primary" />
            <h3 className="text-lg sm:text-xl font-bold">{t}</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
