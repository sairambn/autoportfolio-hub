import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  Github,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSession, saveSession, signInWithToken } from "@/lib/auth";
import { auth, onAuthStateChanged, signInWithGithub, signInWithGoogle } from "@/lib/firebase";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Sign in — Folio" },
      {
        name: "description",
        content: "Sign in with Google or GitHub to create, manage, and publish your portfolio.",
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
  const [busyProvider, setBusyProvider] = useState<"google" | "github" | "token" | null>(null);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const googleCallbackUrl = `${currentOrigin}/api/auth/google`;
  const githubCallbackUrl = `${currentOrigin}/api/auth/github`;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        saveSession({
          token: user.uid,
          user: {
            id:
              Math.abs(
                user.uid.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
              ) || 1,
            login: user.email?.split("@")[0] || "user",
            name: user.displayName || user.email?.split("@")[0] || "User",
            avatar_url: user.photoURL || "",
            html_url: user.email ? `mailto:${user.email}` : "",
            email: user.email || null,
            provider: "google",
          },
          provider: "google",
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        });
        nav({ to: "/dashboard" });
      }
    });

    const s = loadSession();
    if (s && s.user.login !== "guest" && s.token) {
      nav({ to: "/dashboard" });
    }

    return () => unsub();
  }, [nav]);

  async function handleGoogleSignIn() {
    setBusyProvider("google");
    try {
      const user = await signInWithGoogle();
      saveSession({
        token: user.uid,
        user: {
          id:
            Math.abs(
              user.uid.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
            ) || 1,
          login: user.email?.split("@")[0] || "user",
          name: user.displayName || user.email?.split("@")[0] || "User",
          avatar_url: user.photoURL || "",
          html_url: user.email ? `mailto:${user.email}` : "",
          email: user.email || null,
          provider: "google",
        },
        provider: "google",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });
      toast.success(`Welcome, ${user.displayName || user.email}!`);
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        toast.info("Google sign-in window closed.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusyProvider(null);
    }
  }

  async function handleGithubSignIn() {
    setBusyProvider("github");
    try {
      const user = await signInWithGithub();
      saveSession({
        token: user.uid,
        user: {
          id:
            Math.abs(
              user.uid.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
            ) || 1,
          login: user.email?.split("@")[0] || "user",
          name: user.displayName || user.email?.split("@")[0] || "Developer",
          avatar_url: user.photoURL || "",
          html_url: user.email ? `mailto:${user.email}` : "",
          email: user.email || null,
          provider: "github",
        },
        provider: "github",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });
      toast.success(`Welcome, ${user.displayName || "Developer"}!`);
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "GitHub sign-in failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        toast.info("GitHub sign-in window closed.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusyProvider(null);
    }
  }

  async function handleTokenSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusyProvider("token");
    try {
      const user = await signInWithToken(token);
      toast.success(`Signed in as @${user.login}`);
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusyProvider(null);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedUrl(key);
    toast.success("Callback URL copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="grid min-h-screen place-items-center grain px-4 py-12">
      <div className="block-card w-full max-w-md p-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-black italic">
            Folio.
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-accent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            <ShieldCheck className="size-3.5" />
            <span>Secure Sign In</span>
          </div>
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight">Sign in to Folio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Authenticate with your real Google or GitHub account to sync your profile and portfolios
          to Cloud Firestore.
        </p>

        {/* Primary OAuth Actions */}
        <div className="mt-8 space-y-3.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busyProvider !== null}
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg border-2 border-ink bg-white px-5 py-3.5 text-sm font-bold text-ink shadow-[4px_4px_0_0_oklch(0.2_0.02_60)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50"
          >
            {busyProvider === "google" ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <GoogleIcon className="size-5 shrink-0" />
            )}
            <span>
              {busyProvider === "google" ? "Opening Google Sign-In…" : "Sign in with Google"}
            </span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={busyProvider !== null}
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg border-2 border-ink bg-ink px-5 py-3.5 text-sm font-bold text-white shadow-[4px_4px_0_0_oklch(0.2_0.02_60)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50"
          >
            {busyProvider === "github" ? (
              <Loader2 className="size-5 animate-spin text-white/70" />
            ) : (
              <Github className="size-5 shrink-0" />
            )}
            <span>
              {busyProvider === "github" ? "Opening GitHub Sign-In…" : "Sign in with GitHub"}
            </span>
          </button>
        </div>

        {/* Token or Alternative Form */}
        <div className="relative my-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink/20" />
          </div>
          <span className="relative bg-card px-2">or personal token</span>
        </div>

        {!showToken ? (
          <Button
            variant="ghost"
            className="w-full border border-ink/30 text-xs font-semibold"
            onClick={() => setShowToken(true)}
            disabled={busyProvider !== null}
          >
            <KeyRound className="mr-2 size-3.5" /> Sign in with GitHub Personal Access Token
          </Button>
        ) : (
          <form
            onSubmit={handleTokenSubmit}
            className="space-y-3 rounded-lg border border-ink bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">GitHub Personal Token</span>
              <button
                type="button"
                onClick={() => setShowToken(false)}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Hide
              </button>
            </div>
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
                className="font-medium underline"
                href="https://github.com/settings/tokens/new?scopes=public_repo,read:user&description=Folio"
                target="_blank"
                rel="noreferrer"
              >
                github.com/settings/tokens
              </a>{" "}
              with <code>public_repo</code> and <code>read:user</code> scopes.
            </p>
            <Button
              variant="block"
              className="w-full"
              type="submit"
              disabled={busyProvider === "token" || !token.trim()}
            >
              {busyProvider === "token" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Verifying…
                </>
              ) : (
                "Sign in with token"
              )}
            </Button>
          </form>
        )}

        {/* OAuth Configuration Details */}
        <div className="mt-6 border-t border-ink/10 pt-4">
          <button
            type="button"
            onClick={() => setShowConfigHelp((v) => !v)}
            className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="size-3.5" />
              <span>OAuth & Firebase details</span>
            </span>
            <span className="text-xs font-bold">{showConfigHelp ? "Hide" : "Show"}</span>
          </button>

          {showConfigHelp && (
            <div className="mt-3 space-y-3 rounded-lg border border-ink/20 bg-muted/30 p-3 text-xs text-muted-foreground">
              <p>
                Firebase Authentication & Cloud Firestore are active. For custom domain redirects,
                add these callback endpoints:
              </p>
              <div className="space-y-2 font-mono">
                <div>
                  <span className="font-semibold text-foreground">Google Callback URI:</span>
                  <div className="mt-1 flex items-center gap-1 rounded bg-card p-1.5 border">
                    <span className="truncate flex-1 select-all">{googleCallbackUrl}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(googleCallbackUrl, "google")}
                      className="p-1 hover:text-foreground"
                      title="Copy URL"
                    >
                      {copiedUrl === "google" ? (
                        <Check className="size-3 text-primary" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-foreground">GitHub Callback URI:</span>
                  <div className="mt-1 flex items-center gap-1 rounded bg-card p-1.5 border">
                    <span className="truncate flex-1 select-all">{githubCallbackUrl}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(githubCallbackUrl, "github")}
                      className="p-1 hover:text-foreground"
                      title="Copy URL"
                    >
                      {copiedUrl === "github" ? (
                        <Check className="size-3 text-primary" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guest Continue */}
        <div className="mt-4 text-center">
          <Link
            to="/create"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Continue as Guest without account <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
