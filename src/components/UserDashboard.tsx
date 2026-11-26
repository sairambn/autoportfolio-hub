import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Layers,
  LogOut,
  Plus,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { CareerRoadmapTracker } from "@/components/CareerRoadmapTracker";
import { AdminGlobalMetricsView } from "@/components/AdminGlobalMetricsView";
import { CyberSecurityCenter } from "@/components/CyberSecurityCenter";
import { Button } from "@/components/ui/button";
import {
  auth,
  isUserAdmin,
  PRIMARY_ADMIN_USERNAME,
  resolveUserDisplayName,
  onAuthStateChanged,
  subscribeUserPortfolios,
  subscribeUserProfile,
  signOutUser,
  type FirebasePortfolioDoc,
  type UserProfileDoc,
} from "@/lib/firebase";
import { clearSession, loadSession } from "@/lib/auth";

export interface UserDashboardProps {
  defaultTab?: "roadmap" | "portfolios" | "admin";
  hideNavbar?: boolean;
}

export function UserDashboard({
  defaultTab = "roadmap",
  hideNavbar = false,
}: UserDashboardProps = {}) {
  const nav = useNavigate();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [portfolios, setPortfolios] = useState<FirebasePortfolioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roadmap" | "portfolios" | "admin">(defaultTab);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        const local = loadSession();
        if (!local || !local.token) setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const unsubProfile = subscribeUserProfile(
      currentUser.uid,
      (prof) => {
        setProfile(prof);
        setLoading(false);
      },
      () => setLoading(false),
    );
    const unsubPortfolios = subscribeUserPortfolios(
      currentUser.uid,
      (list) => setPortfolios(list),
      () => {},
    );
    return () => {
      unsubProfile();
      unsubPortfolios();
    };
  }, [currentUser]);

  async function handleSignOut() {
    try {
      await signOutUser();
      clearSession();
      toast.success("Signed out successfully");
      nav({ to: "/auth" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign out error");
    }
  }

  const displayEmail = profile?.email || currentUser?.email || "";
  const isAdminUser = isUserAdmin(displayEmail);
  const username =
    profile?.username ||
    (isAdminUser
      ? PRIMARY_ADMIN_USERNAME
      : profile?.githubUsername || currentUser?.email?.split("@")[0] || PRIMARY_ADMIN_USERNAME);
  const displayName = resolveUserDisplayName(
    displayEmail,
    profile?.name || currentUser?.displayName,
  );
  const displayAvatar = profile?.avatarUrl || currentUser?.photoURL || "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className={hideNavbar ? "space-y-6" : "min-h-screen grain"}>
      {!hideNavbar && (
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
          <Link to="/" className="font-display text-2xl font-black italic">
            Folio.
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <CyberSecurityCenter triggerText="Security Shield" />
            {isAdminUser && (
              <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground">
                · Admin
              </span>
            )}
            <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-card px-2.5 sm:px-3 py-1 shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="size-6 rounded-full border border-ink object-cover"
                />
              ) : (
                <div className="grid size-6 place-items-center rounded-full bg-muted">
                  <User className="size-3.5" />
                </div>
              )}
              <div className="flex items-baseline gap-1.5 text-left leading-none max-w-[140px] sm:max-w-none">
                <span className="text-xs font-bold truncate">{displayName}</span>
                <span className="text-[10px] font-mono font-medium text-muted-foreground truncate">
                  @{username}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <div className="block-card mb-8 sm:mb-10 overflow-hidden p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="size-16 rounded-2xl border-2 border-ink object-cover"
                />
              ) : (
                <div className="grid size-16 place-items-center rounded-2xl border-2 border-ink bg-muted">
                  <User className="size-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">{displayName}</h1>
                <p className="text-sm text-muted-foreground">@{username} · {displayEmail}</p>
                {isAdminUser && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full border-2 border-primary bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-black">
                    <ShieldCheck className="size-3.5" />
                    Executive Administrator
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="block"
              size="sm"
              onClick={() => nav({ to: "/create" })}
              className="font-bold"
            >
              <Plus className="mr-1 size-4" /> Create portfolio
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "roadmap"
                ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                : "bg-card border-2 border-ink/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-4" />
            Roadmap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("portfolios")}
            className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "portfolios"
                ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                : "bg-card border-2 border-ink/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-4" />
            Portfolios ({portfolios.length})
          </button>
          {isAdminUser && (
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "admin"
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                  : "bg-card border-2 border-ink/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="size-4" />
              Admin
            </button>
          )}
        </div>

        {activeTab === "roadmap" ? (
          <CareerRoadmapTracker userName={displayName} userEmail={displayEmail} />
        ) : activeTab === "admin" ? (
          <AdminGlobalMetricsView currentEmail={displayEmail} />
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-black">Your Portfolios</h2>
            {portfolios.length === 0 ? (
              <p className="text-muted-foreground">No portfolios yet. Create one to get started.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {portfolios.map((p) => (
                  <div
                    key={p.id}
                    className="block-card p-4 flex flex-col gap-2"
                  >
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">/{p.slug}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => nav({ to: "/editor/$id", params: { id: p.id } })}
                      >
                        Edit
                      </Button>
                      {p.github_repo && (
                        <a
                          href={`https://github.com/${p.github_repo}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="block"
              onClick={() => nav({ to: "/create" })}
              className="mt-4"
            >
              <Plus className="mr-1 size-4" /> Create new portfolio
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
