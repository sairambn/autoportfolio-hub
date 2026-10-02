import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Github, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadSession,
  signInWithToken,
  startGithubLogin,
  startGoogleLogin,
} from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Folio" },
      {
        name: "description",
        content: "Sign in with Google or GitHub to build and publish your portfolio.",
      },
      { property: "og:title", content: "Sign in — Folio" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AuthPage() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (s && s.user.login !== "guest" && s.token) nav({ to: "/dashboard" });
  }, [nav]);

  function oauthGithub() {
    setBusy(true);
    startGithubLogin();
  }

  function oauthGoogle() {
    setBusy(true);
    startGoogleLogin();
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
        <h1 className="mt-6 text-4xl font-black">Sign in</h1>
        <p className="mt-3 text-muted-foreground">
          Use Google for a quick identity, or GitHub when you want to publish to GitHub Pages.
        </p>

        <Button
          variant="block"
          className="mt-8 w-full"
          onClick={oauthGoogle}
          disabled={busy}
        >
          <GoogleIcon className="size-5" />
          {busy ? "Redirecting…" : "Continue with Google"}
        </Button>

        <Button
          variant="blockOutline"
          className="mt-3 w-full"
          onClick={oauthGithub}
          disabled={busy}
        >
          <Github className="size-5" />
          Continue with GitHub
        </Button>

        <div className="my-5 text-center text-xs uppercase tracking-widest text-muted-foreground">
          or GitHub token
        </div>

        {!showToken ? (
          <Button
            variant="ghost"
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
              with <code>public_repo</code> + <code>read:user</code>.
            </p>
            <Button
              variant="block"
              className="w-full"
              type="submit"
              disabled={busy || !token.trim()}
            >
              {busy ? "Checking…" : "Sign in with token"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Google sign-in needs <code>GOOGLE_CLIENT_ID</code> and{" "}
          <code>GOOGLE_CLIENT_SECRET</code> on Vercel. Deploy still uses a GitHub token when you
          publish.
        </p>

        <p className="mt-3 text-center text-sm">
          <Link to="/create" className="underline">
            Continue without account →
          </Link>
        </p>
      </div>
    </div>
  );
}
