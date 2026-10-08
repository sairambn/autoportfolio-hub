import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Edit3,
  ExternalLink,
  Globe,
  Layers,
  Layout,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { ProfessionalDetailsForm } from "@/components/ProfessionalDetailsForm";
import { GithubFirebaseAuth } from "@/components/GithubFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  auth,
  deletePortfolioFromFirestore,
  onAuthStateChanged,
  savePortfolioToFirestore,
  signOutUser,
  subscribeUserPortfolios,
  subscribeUserProfile,
  updateUserProfile,
  type FirebasePortfolioDoc,
  type UserProfileDoc,
} from "@/lib/firebase";
import { clearSession, loadSession, type AuthSession } from "@/lib/auth";
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

export function UserDashboard() {
  const nav = useNavigate();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [portfolios, setPortfolios] = useState<FirebasePortfolioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [avatarInput, setAvatarInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);

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
        if (prof) {
          setNameInput(prof.name || "");
          setBioInput(prof.bio || "");
          setAvatarInput(prof.avatarUrl || "");
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
      await updateUserProfile(currentUser.uid, {
        name: nameInput.trim() || "User",
        bio: bioInput.trim(),
        avatarUrl: avatarInput.trim(),
      });
      toast.success("Profile updated in Firebase");
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

  const displayName =
    profile?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Authenticated User";
  const displayEmail = profile?.email || currentUser?.email || "";
  const displayAvatar = profile?.avatarUrl || currentUser?.photoURL || "";
  const publishedCount = portfolios.filter((p) => p.published || p.github_repo).length;

  return (
    <div className="min-h-screen grain">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-card px-3 py-1 shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]">
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
            <span className="text-xs font-bold">{displayName}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* User Profile Hero Card */}
        <div className="block-card mb-10 overflow-hidden p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Avatar & Identity */}
            <div className="flex items-start gap-5">
              <div className="relative">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="size-20 rounded-2xl border-2 border-ink object-cover shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]"
                  />
                ) : (
                  <div className="grid size-20 place-items-center rounded-2xl border-2 border-ink bg-muted shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]">
                    <User className="size-10 text-muted-foreground" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-ink bg-primary text-white">
                  <Check className="size-3" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black md:text-4xl">{displayName}</h1>
                  <span className="rounded-full border border-ink bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {profile?.provider || "Verified Account"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{displayEmail}</p>
                {profile?.bio && (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/80">
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Name"
                    className="mt-1"
                    required
                  />
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
              Input your professional bio, career experience, and education to generate a structured
              portfolio layout.
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
            {portfolios.map((p) => (
              <div
                key={p.id}
                className="block-card flex flex-col justify-between p-6 transition-all hover:translate-x-0.5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-bold line-clamp-1">{p.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        p.published || p.github_repo
                          ? "bg-accent text-accent-foreground border border-ink"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.published || p.github_repo ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Slug: <code className="font-mono">{p.slug}</code>
                  </p>
                  {p.github_repo && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Globe className="size-3.5" />
                      <span>{p.github_repo}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
                  <div className="flex gap-2">
                    <Button asChild variant="block" size="sm">
                      <Link to="/editor/$id" params={{ id: p.id }}>
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/p/$slug" params={{ slug: p.slug }} target="_blank">
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeletePortfolio(p.id)}
                    title="Delete portfolio"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}
