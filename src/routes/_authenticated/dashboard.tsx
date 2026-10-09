import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  Calendar,
  Layers,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { loadSession, clearSession } from "@/lib/auth";
import {
  auth,
  onAuthStateChanged,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  signOutUser,
  subscribeUserProfile,
} from "@/lib/firebase";
import { UserDashboard } from "@/components/UserDashboard";
import { AdminGlobalMetricsView } from "@/components/AdminGlobalMetricsView";
import { CyberSecurityCenter } from "@/components/CyberSecurityCenter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Folio" },
      {
        name: "description",
        content: "Global platform metrics and portfolio management.",
      },
    ],
  }),
  component: AuthenticatedDashboardRoute,
});

/**
 * Specifically checks if the user is the designated administrator 'bnsairam14@gmail.com'.
 */
function isPlatformAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  // Specifically checks if current user is 'bnsairam14@gmail.com' or session admin
  return (
    clean === "bnsairam14@gmail.com" ||
    clean === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
    clean === "sdesairam@gmail.com"
  );
}

function AuthenticatedDashboardRoute() {
  const nav = useNavigate();
  const [currentEmail, setCurrentEmail] = useState<string>(() => {
    const session = loadSession();
    return session?.user?.email || auth.currentUser?.email || "";
  });
  const [userName, setUserName] = useState<string>(() => {
    const session = loadSession();
    return session?.user?.name || PRIMARY_ADMIN_USERNAME;
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    const session = loadSession();
    return session?.user?.avatar_url || "";
  });
  const [adminTab, setAdminTab] = useState<"global_metrics" | "personal_portfolios">(
    "global_metrics",
  );
  const [loading, setLoading] = useState(true);

  // Sync auth state and verify email
  useEffect(() => {
    // 1. Initial local session check
    const session = loadSession();
    if (session?.user?.email) {
      setCurrentEmail(session.user.email);
      setUserName(session.user.name || PRIMARY_ADMIN_USERNAME);
      if (session.user.avatar_url) setUserAvatar(session.user.avatar_url);
    }

    // 2. Firebase live auth listener
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email || "";
        setCurrentEmail(email);
        if (user.displayName) setUserName(user.displayName);
        if (user.photoURL) setUserAvatar(user.photoURL);

        // 3. Listen to profile doc in Firestore if needed
        const unsubProfile = subscribeUserProfile(user.uid, (prof) => {
          if (prof?.email) setCurrentEmail(prof.email);
          if (prof?.name) setUserName(prof.name);
          if (prof?.avatarUrl) setUserAvatar(prof.avatarUrl);
        });
        setLoading(false);
        return () => unsubProfile();
      } else {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      clearSession();
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
      toast.success("Signed out successfully");
      nav({ to: "/auth" });
    } catch {
      toast.error("Sign out failed");
    }
  };

  // Specifically check if the current user is 'bnsairam14@gmail.com'
  const isTargetAdmin = isPlatformAdmin(currentEmail);

  // If the user is NOT 'bnsairam14@gmail.com', render standard user dashboard
  if (!isTargetAdmin) {
    return <UserDashboard />;
  }

  // If the user IS 'bnsairam14@gmail.com', render the global metrics view
  return (
    <div className="min-h-screen grain">
      {/* Top Admin Navigation Header */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-2xl font-black italic">
            Folio.
          </Link>
          <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground">
            · Admin Suite
          </span>
        </div>

        {/* User Identity & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CyberSecurityCenter triggerText="Cybersecurity Command" />
          <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-card px-2.5 sm:px-3 py-1 shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="size-6 rounded-full border border-ink object-cover"
              />
            ) : (
              <div className="grid size-6 place-items-center rounded-full bg-primary/20 text-primary">
                <ShieldCheck className="size-3.5" />
              </div>
            )}
            <div className="flex items-baseline gap-1.5 text-left leading-none max-w-[140px] sm:max-w-none">
              <span className="text-xs font-bold truncate">bnsairam</span>
              <span className="text-[10px] font-mono font-medium text-muted-foreground truncate">
                @bnsairam
              </span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 space-y-6">
        {/* Navigation Tabs between Global Metrics and Personal Portfolios */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-ink/15 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdminTab("global_metrics")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                adminTab === "global_metrics"
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                  : "border-2 border-ink/20 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="size-4" />
              <span>📊 Global Platform Metrics</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminTab("personal_portfolios")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                adminTab === "personal_portfolios"
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                  : "border-2 border-ink/20 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-4" />
              <span>📁 My Portfolios & Editor</span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Admin: <strong className="text-foreground">bnsairam14@gmail.com</strong>
          </div>
        </div>

        {/* Tab Content */}
        {adminTab === "global_metrics" ? (
          <AdminGlobalMetricsView
            currentEmail={currentEmail}
            onSwitchToPersonalPortfolios={() => setAdminTab("personal_portfolios")}
          />
        ) : (
          <UserDashboard hideNavbar defaultTab="portfolios" />
        )}
      </main>
    </div>
  );
}
