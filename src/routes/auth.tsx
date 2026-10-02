import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Github, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSession, signInWithToken, startGithubLogin } from "@/lib/auth";

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
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (loadSession()) nav({ to: "/dashboard" });
  }, [nav]);

  function oauth() {
    setBusy(true);
    startGithubLogin();
  }

  async function withToken(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithToken(token);
      toast.success("Signed in");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center grain px-4">
      <div className="block-card w-full max-w-md p-8">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <h1 className="mt-6 text-4xl font-black">Sign in with GitHub</h1>
        <p className="mt-3 text-muted-foreground">
          Drafts stay in this browser. Publish writes a static site to your repo and enables GitHub
          Pages.
        </p>

        <Button variant="block" className="mt-8 w-full" onClick={oauth} disabled={busy}>
          <Github className="size-5" />
          {busy && !showToken ? "Redirecting…" : "Continue with GitHub"}
        </Button>

        <div className="my-5 text-center text-xs uppercase tracking-widest text-muted-foreground">
          or use a token
        </div>

        {!showToken ? (
          <Button
            variant="blockOutline"
            className="w-full"
            onClick={() => setShowToken(true)}
            disabled={busy}
          >
            <KeyRound className="size-4" /> Paste personal access token
          </Button>
        ) : (
          <form onSubmit={withToken} className="space-y-3">
            <Input
              type="password"
              autoComplete="off"
              placeholder="ghp_… or github_pat_…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Create a token at{" "}
              <a
                className="underline"
                href="https://github.com/settings/tokens/new?scopes=public_repo,read:user&description=Folio"
                target="_blank"
                rel="noreferrer"
              >
                github.com/settings/tokens
              </a>{" "}
              with <code>public_repo</code> + <code>read:user</code>. Token stays in your browser only.
            </p>
            <Button variant="block" className="w-full" type="submit" disabled={busy || !token.trim()}>
              {busy ? "Checking…" : "Sign in with token"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Nothing is stored on our servers. If OAuth is not set up on this deploy, use a token.
        </p>
      </div>
    </div>
  );
}
