import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubFirebaseAuth } from "@/components/GithubFirebaseAuth";
import { loadSession, saveSession } from "@/lib/auth";
import {
  auth,
  onAuthStateChanged,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  resolveUserDisplayName,
  resolveUsername,
  signInWithEmail,
  signInWithGoogle,
  signInWithTestAccount,
  signUpWithEmail,
} from "@/lib/firebase";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Sign in — Folio" },
      {
        name: "description",
        content:
          "Sign in with Google or GitHub via Firebase Auth to create, manage, and publish your portfolio.",
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
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [busyEmail, setBusyEmail] = useState(false);
  const [busyTest, setBusyTest] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const googleCallbackUrl = `${currentOrigin}/api/auth/google`;
  const githubCallbackUrl = `${currentOrigin}/api/auth/github`;

  const handleTestAccountLogin = async () => {
    setBusyTest(true);
    try {
      let uid = "test_user_demo_101";
      let photoURL = "";
      let displayName = PRIMARY_ADMIN_USERNAME;
      try {
        const user = await signInWithTestAccount();
        uid = user.uid;
        if (user.photoURL) photoURL = user.photoURL;
        if (user.displayName) displayName = user.displayName;
      } catch (fbErr) {
        console.warn("Firebase Auth test signin fallback to local demo session:", fbErr);
      }

      saveSession({
        token: uid,
        user: {
          id:
            Math.abs(
              uid.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
            ) || 101,
          login: PRIMARY_ADMIN_USERNAME,
          name: displayName || PRIMARY_ADMIN_USERNAME,
          avatar_url: photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}`,
          html_url: "mailto:bnsairam14@gmail.com",
          email: "bnsairam14@gmail.com",
          provider: "password",
        },
        provider: "password",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });
      toast.success("Signed in successfully with Test Account!");
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Test login failed";
      toast.error(msg);
    } finally {
      setBusyTest(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setBusyEmail(true);
    try {
      const user = isRegister
        ? await signUpWithEmail(email, password, displayName.trim())
        : await signInWithEmail(email, password);

      const resolvedLogin = resolveUsername(user.email);
      const resolvedName = resolveUserDisplayName(
        user.email,
        displayName.trim() || user.displayName,
      );

      saveSession({
        token: user.uid,
        user: {
          id:
            Math.abs(
              user.uid.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
            ) || 1,
          login: resolvedLogin,
          name: resolvedName,
          avatar_url:
            user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
          html_url: user.email ? `mailto:${user.email}` : "",
          email: user.email || null,
          provider: "password",
        },
        provider: "password",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });

      toast.success(isRegister ? "Account created successfully!" : "Signed in successfully!");
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/user-not-found" ||
        error?.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password. You can also use the 1-Click Test Login below!");
      } else if (error?.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists. Try signing in.");
        setIsRegister(false);
      } else if (error?.code === "auth/weak-password") {
        toast.error("Password must be at least 6 characters.");
      } else {
        toast.error(error?.message || "Authentication failed");
      }
    } finally {
      setBusyEmail(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail("test@folio.dev");
    setPassword("TestPassword123!");
    setIsRegister(false);
    toast.info("Filled test credentials: test@folio.dev");
  };

  const handleGoogleSignIn = useCallback(async () => {
    setBusyGoogle(true);
    try {
      const user = await signInWithGoogle();
      const resolvedLogin = resolveUsername(user.email);
      const resolvedName = resolveUserDisplayName(user.email, user.displayName);
      saveSession({
        token: user.uid,
        user: {
          id:
            Math.abs(
              user.uid.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
            ) || 1,
          login: resolvedLogin,
          name: resolvedName,
          avatar_url: user.photoURL || "",
          html_url: user.email ? `mailto:${user.email}` : "",
          email: user.email || null,
          provider: "google",
        },
        provider: "google",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });
      toast.success(`Welcome, ${resolvedName}!`);
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        toast.info("Google sign-in window closed.");
      } else if (msg.includes("auth/unauthorized-domain")) {
        toast.error(
          "Domain not in Firebase Authorized Domains. Use the 1-Click Test Login or Email/Password above to sign in immediately!",
          { duration: 7000 },
        );
        setShowConfigHelp(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setBusyGoogle(false);
    }
  }, [nav]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const s = loadSession();
        if (!s || s.user.login === "guest") {
          const resolvedLogin = resolveUsername(user.email);
          const resolvedName = resolveUserDisplayName(user.email, user.displayName);
          saveSession({
            token: user.uid,
            user: {
              id:
                Math.abs(
                  user.uid
                    .split("")
                    .reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
                ) || 1,
              login: resolvedLogin,
              name: resolvedName,
              avatar_url: user.photoURL || "",
              html_url: user.email ? `mailto:${user.email}` : "",
              email: user.email || null,
              provider: user.providerData?.[0]?.providerId === "github.com" ? "github" : "google",
            },
            provider: user.providerData?.[0]?.providerId === "github.com" ? "github" : "google",
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
          });
        }
        nav({ to: "/dashboard" });
      }
    });

    const s = loadSession();
    if (s && s.user.login !== "guest" && s.token) {
      nav({ to: "/dashboard" });
    }

    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("auto") === "true" && sp.get("provider") === "google") {
        window.history.replaceState({}, "", "/auth");
        handleGoogleSignIn();
      }
    }

    return () => unsub();
  }, [nav, handleGoogleSignIn]);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedUrl(key);
    toast.success("Callback URL copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="grid min-h-screen place-items-center grain px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Card */}
        <div className="block-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-2xl font-black italic">
              Folio.
            </Link>
            <div className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-accent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
              <ShieldCheck className="size-3.5" />
              <span>Firebase Auth</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">Sign in to Folio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your Google account to create, customize, and publish your student
              portfolio website in under 5 minutes.
            </p>
          </div>

          {/* Primary Hero: 1-Click Google Sign In */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={busyGoogle}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl border-2 border-ink bg-white px-5 py-4 text-base font-bold text-ink shadow-[4px_4px_0_0_oklch(0.2_0.02_60)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50"
            >
              {busyGoogle ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <GoogleIcon className="size-5 shrink-0" />
              )}
              <span>{busyGoogle ? "Opening Google Sign-In…" : "Continue with Google"}</span>
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Recommended for students · Works with college or personal Gmail
            </p>
          </div>

          {/* 1-Click Student Demo Login */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="size-4 text-primary shrink-0" />
              <div>
                <span className="font-bold text-foreground">Lab Wi-Fi or Guest Mode?</span>
                <p className="text-[11px] text-muted-foreground">
                  Instant access without entering passwords.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleTestAccountLogin}
              disabled={busyTest}
              className="font-bold text-xs shrink-0 border-primary/40 bg-card hover:bg-primary hover:text-primary-foreground"
            >
              {busyTest ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                <LogIn className="size-3.5 mr-1" />
              )}
              Instant Demo
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-4 text-center text-xs uppercase tracking-widest text-muted-foreground">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/15" />
            </div>
            <span className="relative bg-card px-2">or sign in with email</span>
          </div>

          {/* Email & Password Form */}
          <form
            onSubmit={handleEmailAuth}
            className="space-y-3 rounded-xl border border-ink/20 bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isRegister ? "Create Account" : "Sign in with Email"}
              </span>
              <button
                type="button"
                onClick={() => setIsRegister((v) => !v)}
                className="text-xs font-semibold text-primary underline"
              >
                {isRegister ? "Have an account? Sign in" : "Need an account? Register"}
              </button>
            </div>

            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-medium">Your Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={busyEmail}
              className="w-full font-bold h-9 text-xs mt-2"
            >
              {busyEmail ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : isRegister ? (
                <UserPlus className="size-4 mr-1.5" />
              ) : (
                <LogIn className="size-4 mr-1.5" />
              )}
              {isRegister ? "Create Account" : "Sign In with Email"}
            </Button>
          </form>

          {/* Optional GitHub Section (Collapsed) */}
          <div className="border-t border-ink/10 pt-4">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between text-xs text-muted-foreground hover:text-foreground">
                <span className="font-semibold flex items-center gap-1.5">
                  <KeyRound className="size-3.5" />
                  <span>Publishing to GitHub Pages? (Optional)</span>
                </span>
                <span className="text-[11px] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 pt-2">
                <GithubFirebaseAuth
                  mode="card"
                  title="GitHub Publishing Access"
                  description="Connect GitHub if you want to automatically publish your site to your own GitHub Pages repo."
                  onAuthSuccess={() => nav({ to: "/dashboard" })}
                />
              </div>
            </details>
          </div>

          {/* OAuth Configuration Details */}
          <div className="border-t border-ink/10 pt-4">
            <button
              type="button"
              onClick={() => setShowConfigHelp((v) => !v)}
              className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="size-3.5" />
                <span>OAuth & Callback details</span>
              </span>
              <span className="text-xs font-bold">{showConfigHelp ? "Hide" : "Show"}</span>
            </button>

            {showConfigHelp && (
              <div className="mt-3 space-y-3 rounded-lg border border-ink/20 bg-muted/30 p-3 text-xs text-muted-foreground">
                <div className="rounded border border-primary/30 bg-primary/5 p-2.5 space-y-1">
                  <span className="font-bold text-foreground block">
                    Firebase Authorized Domains Fix:
                  </span>
                  <p className="text-[11px]">
                    If you see{" "}
                    <code className="font-mono text-destructive">auth/unauthorized-domain</code>,
                    add this domain in Firebase Console:
                  </p>
                  <div className="mt-1 flex items-center gap-1 rounded bg-card p-1.5 border font-mono">
                    <span className="truncate flex-1 select-all font-semibold text-foreground">
                      {typeof window !== "undefined"
                        ? window.location.hostname
                        : "portfoliobuilder-three.vercel.app"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          typeof window !== "undefined"
                            ? window.location.hostname
                            : "portfoliobuilder-three.vercel.app",
                          "domain",
                        )
                      }
                      className="p-1 hover:text-foreground"
                      title="Copy Domain"
                    >
                      {copiedUrl === "domain" ? (
                        <Check className="size-3 text-primary" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1">
                    Steps: Click the link below, go to Authorized domains, and click "Add domain":
                  </p>
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0792314276/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary underline pt-0.5 hover:text-primary/80"
                  >
                    Open Firebase Console Settings <ArrowRight className="size-3" />
                  </a>
                </div>

                <p>OAuth & callback endpoints:</p>
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
          <div className="text-center">
            <Link
              to="/create"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Continue as Guest without account <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
