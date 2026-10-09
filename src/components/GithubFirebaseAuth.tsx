import { useState, useEffect } from "react";
import {
  Github,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  LogOut,
  RefreshCw,
  KeyRound,
  Sparkles,
  GitBranch,
  Globe,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  auth,
  onAuthStateChanged,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  resolveUserDisplayName,
  resolveUsername,
  signInWithGithub,
  signOutUser,
  type GithubAuthResult,
} from "@/lib/firebase";
import {
  loadSession,
  saveSession,
  clearSession,
  signInWithToken,
  type AuthSession,
} from "@/lib/auth";

export interface GithubFirebaseAuthProps {
  mode?: "card" | "compact" | "banner" | "dialog";
  title?: string;
  description?: string;
  requiredScope?: "public_repo" | "repo";
  onAuthSuccess?: (session: AuthSession, result?: GithubAuthResult) => void;
  onSignOut?: () => void;
  className?: string;
  showPatFallback?: boolean;
}

export function GithubFirebaseAuth({
  mode = "card",
  title = "GitHub Authentication",
  description = "Connect your GitHub account via Firebase Auth to publish repositories and deploy live portfolios to GitHub Pages.",
  requiredScope = "repo",
  onAuthSuccess,
  onSignOut,
  className = "",
  showPatFallback = true,
}: GithubFirebaseAuthProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPatInput, setShowPatInput] = useState(false);
  const [patToken, setPatToken] = useState("");
  const [patLoading, setPatLoading] = useState(false);
  const [copiedScope, setCopiedScope] = useState(false);

  // Sync with current auth state
  useEffect(() => {
    const s = loadSession();
    setSession(s);

    const handleAuthChange = () => {
      setSession(loadSession());
    };

    window.addEventListener("folio-auth-change", handleAuthChange);

    const unsubFirebase = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser && session?.provider === "github") {
        // user signed out of firebase
        const current = loadSession();
        if (current?.provider === "github" && !current.token?.startsWith("ghp_")) {
          setSession(null);
        }
      }
    });

    return () => {
      window.removeEventListener("folio-auth-change", handleAuthChange);
      unsubFirebase();
    };
  }, [session?.provider]);

  const isConnected =
    Boolean(session?.token) && session?.user?.login !== "guest" && session?.provider === "github";

  async function handleGithubLogin() {
    setLoading(true);
    try {
      const res = await signInWithGithub();
      const user = res.user;
      const rawGh =
        res.githubUsername || user.displayName?.replace(/\s+/g, "").toLowerCase() || "developer";
      const ghUsername = resolveUsername(user.email, rawGh);
      const ghDisplayName = resolveUserDisplayName(user.email, user.displayName || ghUsername);

      // Compute safe numeric ID
      const numericId =
        Math.abs(
          user.uid.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
        ) || 1;

      const newSession: AuthSession = {
        token: res.accessToken || user.uid,
        user: {
          id: numericId,
          login: ghUsername,
          name: ghDisplayName,
          avatar_url: user.photoURL || `https://github.com/${ghUsername}.png`,
          html_url: `https://github.com/${ghUsername}`,
          email: user.email || null,
          provider: "github",
        },
        provider: "github",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      };

      saveSession(newSession);
      setSession(newSession);
      toast.success(`Connected to GitHub as @${ghUsername}!`);
      onAuthSuccess?.(newSession, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "GitHub authentication failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        toast.info("GitHub sign-in popup was closed.");
      } else if (msg.includes("auth/operation-not-allowed")) {
        toast.info(
          "GitHub OAuth is not configured on this Firebase instance. Switched to Personal Access Token mode so you can continue immediately!",
          { duration: 7000 },
        );
        setShowPatInput(true);
      } else if (msg.includes("auth/popup-blocked") || msg.includes("popup-blocked")) {
        toast.error(
          "Browser blocked popup window. Please enable popups or use Personal Access Token below.",
        );
        setShowPatInput(true);
      } else if (msg.includes("auth/account-exists-with-different-credential")) {
        toast.error(
          "An account with this email already exists with another provider. Please sign in with Google or use a token.",
        );
      } else if (msg.includes("auth/unauthorized-domain")) {
        toast.error(
          "This domain is not in Firebase's Authorized Domains list. Switched to Personal Access Token mode so you can continue!",
          { duration: 6000 },
        );
        setShowPatInput(true);
      } else {
        toast.info(
          "GitHub OAuth is unavailable on this deploy. Switched to Personal Access Token mode below.",
          { duration: 6000 },
        );
        setShowPatInput(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patToken.trim()) {
      toast.error("Please enter a GitHub Personal Access Token");
      return;
    }
    setPatLoading(true);
    try {
      const user = await signInWithToken(patToken.trim());
      const newSession: AuthSession = {
        token: patToken.trim(),
        user,
        provider: "github",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 90,
      };
      saveSession(newSession);
      setSession(newSession);
      setShowPatInput(false);
      setPatToken("");
      toast.success(`Connected via Personal Access Token as @${user.login}!`);
      onAuthSuccess?.(newSession);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid Personal Access Token");
    } finally {
      setPatLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    clearSession();
    setSession(null);
    toast.info("Signed out from GitHub.");
    onSignOut?.();
  }

  function handleCopyScope() {
    navigator.clipboard.writeText("repo, public_repo, read:user, user:email");
    setCopiedScope(true);
    toast.success("GitHub scopes copied to clipboard!");
    setTimeout(() => setCopiedScope(false), 2000);
  }

  // --- Compact Mode (Toolbars / Headers / Dropdowns) ---
  if (mode === "compact") {
    if (isConnected && session) {
      return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-xs">
            <img
              src={session.user.avatar_url || "https://github.com/github.png"}
              alt={session.user.login}
              className="size-5 rounded-full border border-border/50 object-cover"
            />
            <span className="font-mono text-xs font-medium">@{session.user.login}</span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              Repo Scope
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            title="Disconnect GitHub"
            aria-label="Disconnect GitHub"
          >
            <LogOut className="size-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleGithubLogin}
        disabled={loading}
        className={`gap-2 font-mono text-xs ${className}`}
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Github className="size-3.5" />}
        Connect GitHub
      </Button>
    );
  }

  // --- Banner Mode (Notice bars / In-flow prompts) ---
  if (mode === "banner") {
    if (isConnected && session) {
      return (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-foreground ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="font-medium">
                GitHub Connected as <strong className="font-mono">@{session.user.login}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Firebase Auth active with repository access scope ({requiredScope}). Ready to
                publish portfolios.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${session.user.login}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Profile <ExternalLink className="size-3" />
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGithubLogin}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className="mr-1 size-3" /> Reconnect
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Github className="size-5" />
          </div>
          <div>
            <p className="font-semibold">GitHub Repository Access Required</p>
            <p className="text-xs text-muted-foreground">
              Sign in with GitHub via Firebase Auth to create repositories and deploy static sites
              to GitHub Pages.
            </p>
          </div>
        </div>
        <Button
          variant="block"
          size="sm"
          onClick={handleGithubLogin}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
          Connect GitHub Now
        </Button>
      </div>
    );
  }

  // --- Default Card / Full Feature Mode ---
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background shadow-xs">
            <Github className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          Firebase Auth
        </div>
      </div>

      {/* Connected State */}
      {isConnected && session ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
            <div className="flex items-center gap-3">
              <img
                src={session.user.avatar_url || "https://github.com/github.png"}
                alt={session.user.login}
                className="size-10 rounded-full border border-border object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {session.user.name || session.user.login}
                  </span>
                  <a
                    href={`https://github.com/${session.user.login}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-muted-foreground hover:underline inline-flex items-center gap-0.5"
                  >
                    @{session.user.login}
                    <ExternalLink className="size-2.5" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.user.email || "Repository permissions active"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Connected
              </span>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-card p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <GitBranch className="size-3.5 text-primary" />
                Auto-Commit
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Commits files atomically via Git Data APIs
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Globe className="size-3.5 text-primary" />
                GitHub Pages
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Automated DNS & static hosting on github.io
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Zero Config
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Auto creates repo and pushes live HTML
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Scope:{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                {requiredScope}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGithubLogin}
                disabled={loading}
                className="text-xs"
              >
                {loading ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 size-3.5" />
                )}
                Switch Account
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="mr-1.5 size-3.5" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Not Connected State */
        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                <GitBranch className="size-4" />
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">What this permission allows:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Creates a dedicated portfolio repository under your GitHub account</li>
                  <li>Publishes clean static HTML, CSS, JSON & README</li>
                  <li>
                    Enables free HTTPS hosting via GitHub Pages (e.g.{" "}
                    <code className="font-mono text-[10px]">username.github.io/portfolio</code>)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="block"
              size="lg"
              onClick={handleGithubLogin}
              disabled={loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting to GitHub...
                </>
              ) : (
                <>
                  <Github className="size-4" />
                  Connect with GitHub via Firebase
                </>
              )}
            </Button>

            {showPatFallback && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowPatInput(!showPatInput)}
                className="gap-2"
              >
                <KeyRound className="size-4" />
                {showPatInput ? "Hide PAT" : "Use Access Token"}
              </Button>
            )}
          </div>

          {/* Personal Access Token Fallback Drawer */}
          {showPatFallback && showPatInput && (
            <form
              onSubmit={handlePatSubmit}
              className="mt-4 rounded-lg border border-border bg-muted/20 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="pat-input" className="text-xs font-semibold">
                  Personal Access Token (Classic)
                </Label>
                <button
                  type="button"
                  onClick={handleCopyScope}
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  {copiedScope ? <Check className="size-3" /> : <Copy className="size-3" />}
                  Copy Required Scopes
                </button>
              </div>

              <div className="flex gap-2">
                <Input
                  id="pat-input"
                  type="password"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="font-mono text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="block"
                  disabled={patLoading || !patToken.trim()}
                >
                  {patLoading ? <Loader2 className="size-3.5 animate-spin" /> : "Verify & Continue"}
                </Button>
              </div>

              {/* 3-Step Token Guide Accordion (Screenshots-as-text) */}
              <div className="rounded-lg border border-border/80 bg-background/80 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>How to make a token (Takes 60 seconds):</span>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=public_repo,read:user,user:email&description=Folio%20Portfolio%20Publisher"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                  >
                    Open GitHub Tokens <ExternalLink className="size-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground text-[11px]">
                  <li>
                    Go to{" "}
                    <strong>
                      GitHub → Settings → Developer settings → Personal access tokens → Tokens
                      (classic)
                    </strong>
                  </li>
                  <li>
                    Click <strong>Generate new token (classic)</strong> → Note:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">Folio</code> →
                    Expiration: <strong>7 days</strong>
                  </li>
                  <li>
                    Select scope{" "}
                    <code className="bg-primary/10 text-primary font-bold px-1 py-0.5 rounded font-mono">
                      public_repo
                    </code>{" "}
                    (or <code className="bg-muted px-1 py-0.5 rounded font-mono">repo</code>) →
                    Click <strong>Generate token</strong> at the bottom → Copy & paste above
                  </li>
                </ol>
                <div className="rounded bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-900 dark:text-amber-200">
                  ⚠️ <strong>Warning:</strong> Never share or screenshot your token. Folio keeps it
                  in this browser tab only (
                  <code className="font-mono text-[10px]">sessionStorage</code>) and sends it
                  directly to <code className="font-mono text-[10px]">api.github.com</code>.
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
