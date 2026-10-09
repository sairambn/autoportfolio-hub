import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileCode2,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Layout,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { ProfessionalDetailsForm } from "@/components/ProfessionalDetailsForm";
import { GithubFirebaseAuth } from "@/components/GithubFirebaseAuth";
import { CareerRoadmapTracker } from "@/components/CareerRoadmapTracker";
import { PlacementAgencyAdmin } from "@/components/PlacementAgencyAdmin";
import { AdminGlobalMetricsView } from "@/components/AdminGlobalMetricsView";
import { GeminiChatbot } from "@/components/GeminiChatbot";
import { ExportPdfModal } from "@/components/ExportPdfModal";
import { CyberSecurityCenter } from "@/components/CyberSecurityCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRepoAndPushPortfolioHtml } from "@/lib/github-client";
import {
  auth,
  deletePortfolioFromFirestore,
  isUserAdmin,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  resolveUserDisplayName,
  resolveUsername,
  onAuthStateChanged,
  savePortfolioToFirestore,
  signOutUser,
  subscribeUserPortfolios,
  subscribeUserProfile,
  updateUserProfile,
  type FirebasePortfolioDoc,
  type UserProfileDoc,
} from "@/lib/firebase";
import { clearSession, loadSession, saveSession, type AuthSession } from "@/lib/auth";
import {
  createPortfolio,
  defaultContent,
  defaultSections,
  defaultTheme,
  uid,
  type Content,
  type Section,
  type Theme,
} from "@/lib/portfolio";
import { deletePortfolio, upsertPortfolio, type PortfolioRecord } from "@/lib/storage";

export interface UserDashboardProps {
  defaultTab?: "roadmap" | "portfolios" | "admin" | "ai";
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
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [avatarInput, setAvatarInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});
  const [pdfModalPortfolio, setPdfModalPortfolio] = useState<FirebasePortfolioDoc | null>(null);
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"roadmap" | "portfolios" | "admin" | "ai">(defaultTab);

  async function handleFormGenerateFromDashboard(data: {
    content: Content;
    theme: Theme;
    sections: Section[];
    title: string;
  }) {
    if (!currentUser) return;
    const session = loadSession();
    const login = session?.user.login || "user";
    const newId = uid() + uid();
    const slug = `portfolio-${uid().slice(0, 4)}`;
    const newPortfolio: FirebasePortfolioDoc = {
      id: newId,
      userId: currentUser.uid,
      slug,
      title: data.title || `${data.content.name || "My"} Portfolio`,
      published: false,
      github_repo: null,
      auto_push: false,
      last_pushed_at: null,
      content: data.content,
      theme: data.theme,
      sections: data.sections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertPortfolio(login, {
      id: newId,
      slug,
      title: newPortfolio.title,
      content: newPortfolio.content as Content,
      theme: newPortfolio.theme as Theme,
      sections: newPortfolio.sections as Section[],
      published: false,
      github_repo: null,
      auto_push: false,
      last_pushed_at: null,
      updated_at: newPortfolio.updatedAt,
      created_at: newPortfolio.createdAt,
    });

    try {
      await savePortfolioToFirestore(currentUser.uid, newPortfolio);
      toast.success("Structured portfolio generated successfully!");
      setShowFormBuilderModal(false);
      nav({ to: "/editor/$id", params: { id: newId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create portfolio");
    }
  }

  // Sync auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // Fallback to local session check if available
        const local = loadSession();
        if (!local || !local.token) {
          setLoading(false);
        }
      }
    });
    return () => unsubAuth();
  }, []);

  // Listen to Firestore profile and portfolios
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubProfile = subscribeUserProfile(
      currentUser.uid,
      (prof) => {
        setProfile(prof);
        const isAdmin = isUserAdmin(prof?.email || currentUser.email);
        if (prof) {
          setNameInput(prof.name || (isAdmin ? PRIMARY_ADMIN_USERNAME : ""));
          setUsernameInput(
            prof.username || (isAdmin ? PRIMARY_ADMIN_USERNAME : prof.githubUsername || ""),
          );
          setBioInput(prof.bio || "");
          setAvatarInput(prof.avatarUrl || "");
        } else if (isAdmin) {
          setNameInput(PRIMARY_ADMIN_USERNAME);
          setUsernameInput(PRIMARY_ADMIN_USERNAME);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Profile subscription error:", err);
        setLoading(false);
      },
    );

    const unsubPortfolios = subscribeUserPortfolios(
      currentUser.uid,
      (list) => {
        setPortfolios(list);
        const session = loadSession();
        const login = session?.user.login || "user";
        list.forEach((p) => {
          upsertPortfolio(login, {
            id: p.id,
            slug: p.slug,
            title: p.title,
            content: (p.content as Content) || defaultContent(),
            theme: (p.theme as Theme) || defaultTheme(),
            sections: (p.sections as Section[]) || defaultSections(),
            published: p.published,
            github_repo: p.github_repo,
            auto_push: p.auto_push,
            last_pushed_at: p.last_pushed_at,
            updated_at: p.updatedAt,
            created_at: p.createdAt,
          });
        });
      },
      (err) => {
        console.error("Portfolios subscription error:", err);
      },
    );

    return () => {
      unsubProfile();
      unsubPortfolios();
    };
  }, [currentUser]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    try {
      const isAdmin = isUserAdmin(currentUser.email || profile?.email);
      const cleanName = nameInput.trim() || (isAdmin ? PRIMARY_ADMIN_USERNAME : "User");
      const cleanUsername =
        usernameInput
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "") || (isAdmin ? PRIMARY_ADMIN_USERNAME : "bnsairam");

      await updateUserProfile(currentUser.uid, {
        name: cleanName,
        username: cleanUsername,
        bio: bioInput.trim(),
        avatarUrl: avatarInput.trim(),
      });

      const s = loadSession();
      if (s) {
        saveSession({
          ...s,
          user: {
            ...s.user,
            name: cleanName,
            login: cleanUsername,
          },
        });
      }

      toast.success("Profile and username updated in Firebase!");
      setEditingProfile(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePortfolio() {
    if (!currentUser) return;
    const session = loadSession();
    const login = session?.user.login || "user";
    const newId = uid() + uid();
    const slug = `portfolio-${uid().slice(0, 4)}`;
    const newPortfolio: FirebasePortfolioDoc = {
      id: newId,
      userId: currentUser.uid,
      slug,
      title: `${profile?.name || "My"} Portfolio`,
      published: false,
      github_repo: null,
      auto_push: false,
      last_pushed_at: null,
      content: defaultContent(),
      theme: defaultTheme(),
      sections: defaultSections(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertPortfolio(login, {
      id: newId,
      slug,
      title: newPortfolio.title,
      content: newPortfolio.content as Content,
      theme: newPortfolio.theme as Theme,
      sections: newPortfolio.sections as Section[],
      published: false,
      github_repo: null,
      auto_push: false,
      last_pushed_at: null,
      updated_at: newPortfolio.updatedAt,
      created_at: newPortfolio.createdAt,
    });

    try {
      await savePortfolioToFirestore(currentUser.uid, newPortfolio);
      toast.success("New portfolio created");
      nav({ to: "/editor/$id", params: { id: newId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create portfolio");
    }
  }

  async function handleDeletePortfolio(portfolioId: string) {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    const session = loadSession();
    const login = session?.user.login || "user";
    deletePortfolio(login, portfolioId);
    try {
      await deletePortfolioFromFirestore(currentUser.uid, portfolioId);
      toast.success("Portfolio removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deletion failed");
    }
  }

  async function handleSignOut() {
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
  const publishedCount = portfolios.filter((p) => p.published || p.github_repo).length;

  async function handleSyncWithGithub(portfolio: FirebasePortfolioDoc) {
    if (!currentUser) return;
    setSyncingMap((prev) => ({ ...prev, [portfolio.id]: true }));
    try {
      const session = loadSession();
      const token = session?.token;
      const targetRepo = portfolio.github_repo || `${username}/${portfolio.slug}`;

      if (token && token.length > 5) {
        try {
          await createRepoAndPushPortfolioHtml({
            token,
            repoName: targetRepo,
            portfolio: {
              id: portfolio.id,
              slug: portfolio.slug,
              title: portfolio.title,
              content: portfolio.content as Content,
              theme: portfolio.theme as Theme,
              sections: portfolio.sections as Section[],
            },
          });
        } catch (pushErr) {
          console.warn("Direct GitHub Pages sync notice:", pushErr);
        }
      }

      const now = new Date().toISOString();
      const updatedDoc: FirebasePortfolioDoc = {
        ...portfolio,
        published: true,
        github_repo: targetRepo,
        last_pushed_at: now,
        updatedAt: now,
      };

      await savePortfolioToFirestore(currentUser.uid, updatedDoc);

      const login = session?.user?.login || "user";
      upsertPortfolio(login, {
        id: updatedDoc.id,
        slug: updatedDoc.slug,
        title: updatedDoc.title,
        content: updatedDoc.content as Content,
        theme: updatedDoc.theme as Theme,
        sections: updatedDoc.sections as Section[],
        published: true,
        github_repo: targetRepo,
        auto_push: updatedDoc.auto_push,
        last_pushed_at: now,
        updated_at: now,
        created_at: updatedDoc.createdAt,
      });

      toast.success(`Synchronized with GitHub (${targetRepo}) successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "GitHub sync encountered an issue");
    } finally {
      setSyncingMap((prev) => ({ ...prev, [portfolio.id]: false }));
    }
  }

  return (
    <div className={hideNavbar ? "space-y-6" : "min-h-screen grain"}>
      {/* Navbar - Mobile & Desktop Optimized */}
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
        {/* User Profile Hero Card - Responsive */}
        <div className="block-card mb-8 sm:mb-10 overflow-hidden p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
              <div className="relative shrink-0">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="size-16 sm:size-20 rounded-2xl border-2 border-ink object-cover shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]"
                  />
                ) : (
                  <div className="grid size-16 sm:size-20 place-items-center rounded-2xl border-2 border-ink bg-muted shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]">
                    <User className="size-8 sm:size-10 text-muted-foreground" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-ink bg-primary text-white">
                  <Check className="size-3" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">{displayName}</h1>
                  <span className="inline-flex items-center rounded-md border border-ink/20 bg-muted/70 px-2 py-0.5 font-mono text-xs sm:text-sm font-bold text-foreground">
                    @{username}
                  </span>
                  {isAdminUser ? (
                    <span className="rounded-full border-2 border-primary bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-black shadow-xs flex items-center gap-1">
                      <ShieldCheck className="size-3.5" />
                      Executive Administrator
                    </span>
                  ) : (
                    <span className="rounded-full border border-ink bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {profile?.provider || "Verified Account"}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="font-medium break-all">{displayEmail}</span>
                  <span className="hidden sm:inline">&bull;</span>
                  <span className="font-mono text-foreground font-semibold flex items-center gap-1">
                    <User className="size-3.5 text-primary" /> Username:{" "}
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono font-bold text-primary">
                      {username}
                    </span>
                  </span>
                </div>
                {isAdminUser && (
                  <p className="mt-1 text-xs font-semibold text-primary flex items-center gap-1">
                    <ShieldCheck className="size-3.5" /> Platform Administrator &bull; Admin:{" "}
                    <strong>{PRIMARY_ADMIN_USERNAME}</strong> ({PRIMARY_ADMIN_EMAIL})
                  </p>
                )}
                {profile?.bio && (
                  <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-foreground/80">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={editingProfile ? "default" : "blockOutline"}
                size="sm"
                onClick={() => setEditingProfile((v) => !v)}
              >
                <Edit3 className="mr-1.5 size-4" />
                {editingProfile ? "Cancel" : "Edit Profile"}
              </Button>
              <Button variant="block" size="sm" onClick={handleCreatePortfolio}>
                <Plus className="mr-1.5 size-4" /> New Portfolio
              </Button>
            </div>
          </div>

          {/* Profile Edit Drawer Form */}
          {editingProfile && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-6 space-y-4 rounded-xl border-2 border-ink bg-muted/20 p-5 animate-rise"
            >
              <h3 className="font-bold">Edit Profile</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="bnsairam"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                      @
                    </span>
                    <Input
                      value={usernameInput}
                      onChange={(e) =>
                        setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                      }
                      placeholder="bnsairam"
                      className="pl-7 font-mono text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Avatar Image URL</Label>
                  <Input
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Bio / Headline</Label>
                <Textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Share what you do or your current focus..."
                  className="mt-1 min-h-[70px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="block" size="sm" disabled={saving}>
                  <Save className="mr-1.5 size-4" /> {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t-2 border-ink/10 pt-6 md:grid-cols-4">
            <div className="rounded-lg border border-ink/20 bg-card p-3 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Portfolios
              </span>
              <div className="mt-1 text-2xl font-black">{portfolios.length}</div>
            </div>
            <div className="rounded-lg border border-ink/20 bg-card p-3 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Published
              </span>
              <div className="mt-1 text-2xl font-black text-primary">{publishedCount}</div>
            </div>
            <div className="rounded-lg border border-ink/20 bg-card p-3 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Drafts
              </span>
              <div className="mt-1 text-2xl font-black text-muted-foreground">
                {portfolios.filter((p) => !p.published && !p.github_repo).length}
              </div>
            </div>
            <div className="rounded-lg border border-ink/20 bg-card p-3 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Account Status
              </span>
              <div className="mt-1 text-sm font-bold text-foreground">Active & Synced</div>
            </div>
          </div>
        </div>

        {/* Dashboard Mode Switcher Tabs - Mobile Touch & Desktop Responsive */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-ink/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("roadmap")}
              className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === "roadmap"
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                  : "bg-card border-2 border-ink/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-4" />
              <span>🎯 Prep Roadmap (Sheets)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("portfolios")}
              className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === "portfolios"
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                  : "bg-card border-2 border-ink/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-4" />
              <span>📁 Portfolios ({portfolios.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === "admin"
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                  : "bg-card border-2 border-ink/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="size-4" />
              <span>🏢 Executive Admin Suite</span>
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-black text-ink border border-ink/30">
                ADMIN
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === "ai"
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                  : "bg-card border-2 border-ink/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-4 text-accent" />
              <span>✨ Free AI Mentor</span>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                FREE
              </span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground font-medium hidden sm:block">
            {activeTab === "roadmap"
              ? "Structured 4-Year Engineering Prep & Sheets Sync"
              : activeTab === "admin"
                ? "Portfolios Created & Candidate Directory"
                : activeTab === "ai"
                  ? "Lifelong Free Gemini AI Chatbot"
                  : "Live Portfolios & GitHub Deploys"}
          </div>
        </div>

        {activeTab === "roadmap" ? (
          <CareerRoadmapTracker userName={displayName} userEmail={displayEmail} />
        ) : activeTab === "admin" ? (
          <AdminGlobalMetricsView currentEmail={displayEmail} />
        ) : activeTab === "ai" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-ink bg-card p-4 sm:p-6 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <Sparkles className="size-3.5" />
                  LIFELONG FREE AI &bull; MULTI-TURN CHAT
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  Folio AI Career & Portfolio Mentor
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Powered by Google Gemini models for portfolio design, resume bullet polishing, and
                  technical interview roadmaps.
                </p>
              </div>
            </div>
            <GeminiChatbot mode="embedded" />
          </div>
        ) : (
          <>
            {/* GitHub Integration Banner */}
            <div className="mb-8">
              <GithubFirebaseAuth
                mode="banner"
                title="GitHub Publishing Integration"
                description="Connect your GitHub account for automated repository creation and 1-click deployments to GitHub Pages."
              />
            </div>

            {/* Portfolios Section */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-black">Your Projects & Portfolios</h2>
                <p className="text-sm text-muted-foreground">
                  Stored securely and ready to edit, preview, or publish live.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-ink font-bold"
                  onClick={() => setShowFormBuilderModal(true)}
                >
                  <Sparkles className="mr-1.5 size-4 text-primary" /> Professional Details Builder
                </Button>
                <Button variant="block" size="sm" onClick={handleCreatePortfolio}>
                  <Plus className="mr-1 size-4" /> Quick Blank
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid place-items-center rounded-2xl border-2 border-ink bg-card p-12">
                <RefreshCw className="size-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Loading your portfolios…</p>
              </div>
            ) : portfolios.length === 0 ? (
              <div className="block-card p-12 text-center">
                <Layers className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-bold">No portfolios created yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Input your professional bio, career experience, and education to generate a
                  structured portfolio layout.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    variant="block"
                    onClick={() => setShowFormBuilderModal(true)}
                    className="font-bold"
                  >
                    <Sparkles className="mr-1.5 size-4" /> Open Professional Details Form
                  </Button>
                  <Button variant="outline" onClick={handleCreatePortfolio} className="border-ink">
                    <Plus className="mr-1.5 size-4" /> Quick Blank
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {portfolios.map((p) => {
                  const isSyncing = !!syncingMap[p.id];
                  const isPublished = Boolean(p.published || p.github_repo);

                  return (
                    <div
                      key={p.id}
                      className="block-card flex flex-col justify-between p-6 transition-all hover:translate-x-0.5 hover:-translate-y-0.5"
                    >
                      <div>
                        {/* Title and Top GitHub Sync State Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-xl font-bold line-clamp-1">{p.title}</h3>
                          {/* Status indicator displaying the current synchronization state with GitHub */}
                          {isSyncing ? (
                            <span
                              title="Synchronizing changes with GitHub repository..."
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse"
                            >
                              <RefreshCw className="size-3 animate-spin" />
                              Syncing
                            </span>
                          ) : isPublished ? (
                            <span
                              title={
                                p.github_repo
                                  ? `Published and synced with GitHub: ${p.github_repo}`
                                  : "Published live on GitHub Pages"
                              }
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                            >
                              <CheckCircle2 className="size-3" />
                              Published
                            </span>
                          ) : (
                            <span
                              title="Draft — Not yet synced with GitHub repository"
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-muted/60 px-2.5 py-0.5 text-xs font-bold text-muted-foreground"
                            >
                              <FileCode2 className="size-3" />
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Slug: <code className="font-mono">{p.slug}</code>
                        </p>

                        {/* GitHub Synchronization Detailed Information */}
                        <div className="mt-3 rounded-lg border border-ink/10 bg-muted/30 p-2.5 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sync State:</span>
                            <span className="font-mono font-bold">
                              {isSyncing ? (
                                <span className="text-amber-600 flex items-center gap-1">
                                  <RefreshCw className="size-3 animate-spin" /> Syncing
                                </span>
                              ) : isPublished ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="size-3" /> Published
                                </span>
                              ) : (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <FileCode2 className="size-3" /> Draft
                                </span>
                              )}
                            </span>
                          </div>

                          {p.github_repo ? (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">GitHub Repo:</span>
                              <a
                                href={`https://github.com/${p.github_repo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono font-semibold text-primary hover:underline flex items-center gap-1 truncate max-w-[170px]"
                                title={`Open repository https://github.com/${p.github_repo}`}
                              >
                                <Globe className="size-3 shrink-0" />
                                <span className="truncate">{p.github_repo}</span>
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>GitHub Repo:</span>
                              <span className="italic text-[11px]">Unlinked (Draft)</span>
                            </div>
                          )}

                          {p.last_pushed_at && (
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Last Synced:</span>
                              <span className="font-mono">
                                {new Date(p.last_pushed_at).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 gap-2">
                        <div className="flex items-center gap-1.5">
                          <Button asChild variant="block" size="sm" className="font-bold text-xs">
                            <Link to="/editor/$id" params={{ id: p.id }}>
                              Edit
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="border-ink px-2.5">
                            <Link
                              to="/p/$slug"
                              params={{ slug: p.slug }}
                              target="_blank"
                              title="Live Preview"
                            >
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </Button>
                          {/* 1-Click GitHub Sync Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSyncing}
                            onClick={() => handleSyncWithGithub(p)}
                            className="border-ink text-xs font-bold px-2.5"
                            title={
                              isPublished
                                ? "Synchronize latest portfolio updates to GitHub"
                                : "Push and sync this draft portfolio to GitHub"
                            }
                          >
                            <RefreshCw
                              className={`size-3.5 ${isSyncing ? "animate-spin text-amber-500 mr-1" : "mr-1 text-primary"}`}
                            />
                            {isSyncing ? "Syncing…" : isPublished ? "Sync" : "Push to GitHub"}
                          </Button>

                          {/* Export as PDF button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPdfModalPortfolio(p)}
                            className="border-ink text-xs font-bold px-2.5 hover:bg-primary/10 hover:text-primary transition-all"
                            title="Export portfolio as PDF file for offline viewing or printing"
                          >
                            <FileText className="mr-1 size-3.5 text-primary" />
                            PDF
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => handleDeletePortfolio(p.id)}
                          title="Delete portfolio"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Professional Details Form Builder Modal */}
      {showFormBuilderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto max-w-6xl rounded-2xl border-4 border-ink bg-background p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b-2 border-ink pb-4">
              <div>
                <h2 className="font-display text-3xl font-black">Generate Structured Portfolio</h2>
                <p className="text-xs text-muted-foreground">
                  Complete your professional profile and click Generate to create a customized
                  portfolio.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFormBuilderModal(false)}
                className="font-bold"
              >
                ✕ Close
              </Button>
            </div>

            <ProfessionalDetailsForm
              initialContent={{
                name: profile?.name || currentUser?.displayName || "",
                bio: profile?.bio || "",
                avatarUrl: profile?.avatarUrl || currentUser?.photoURL || "",
                githubUsername: profile?.githubUsername || "",
              }}
              onGenerate={handleFormGenerateFromDashboard}
            />
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {pdfModalPortfolio && (
        <ExportPdfModal
          open={!!pdfModalPortfolio}
          onClose={() => setPdfModalPortfolio(null)}
          title={pdfModalPortfolio.title}
          slug={pdfModalPortfolio.slug}
          content={pdfModalPortfolio.content}
          theme={pdfModalPortfolio.theme}
          sections={pdfModalPortfolio.sections}
        />
      )}
    </div>
  );
}
