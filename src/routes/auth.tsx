import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSession, startGithubLogin } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Folio" },
      { name: "description", content: "Sign in with GitHub to build and publish your portfolio." },
      { property: "og:title", content: "Sign in — Folio" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loadSession()) nav({ to: "/dashboard" });
  }, [nav]);

  function login() {
    setBusy(true);
    startGithubLogin();
  }

  return (
    <div className="grid min-h-screen place-items-center grain px-4">
      <div className="block-card w-full max-w-md p-8">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <h1 className="mt-6 text-4xl font-black">Sign in with GitHub</h1>
        <p className="mt-3 text-muted-foreground">
          No account database. Your drafts stay in this browser. Publishing writes a static site to
          your GitHub repo and enables Pages.
        </p>
        <Button variant="block" className="mt-8 w-full" onClick={login} disabled={busy}>
          <Github className="size-5" />
          {busy ? "Redirecting…" : "Continue with GitHub"}
        </Button>
        <p className="mt-6 text-xs text-muted-foreground">
          We only request public repo access so Folio can push your portfolio HTML. Nothing is stored
          on our servers.
        </p>
      </div>
    </div>
  );
}
