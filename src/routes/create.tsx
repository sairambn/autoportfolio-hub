import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  ImagePlus,
  Layout,
  ListOrdered,
  Loader2,
  Plus,
  QrCode,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { LivePortfolioPreview } from "@/components/LivePortfolioPreview";
import { ProfessionalDetailsForm } from "@/components/ProfessionalDetailsForm";
import { RoleSkillSuggestions } from "@/components/RoleSkillSuggestions";
import { CyberSecurityCenter } from "@/components/CyberSecurityCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureGuestSession, signInWithToken, loadSession, type AuthSession } from "@/lib/auth";
import { createRepoAndPushPortfolioHtml } from "@/lib/github-client";
import { downloadPortfolioHtml, downloadPortfolioPdf } from "@/lib/download";
import {
  defaultContent,
  defaultSections,
  TEMPLATE_ORDER,
  TEMPLATES,
  type Content,
  type TemplateId,
  type Theme,
  type Section,
} from "@/lib/portfolio";
import { fileToDataUrl, parseResumeText, readResumeFile } from "@/lib/resume-parse";
import { createPortfolio, updatePortfolio } from "@/lib/storage";
import {
  auth,
  savePortfolioToFirestore,
  signInWithGoogle,
  resolveUserDisplayName,
  resolveUsername,
  type FirebasePortfolioDoc,
} from "@/lib/firebase";
import { saveSession } from "@/lib/auth";

export const Route = createFileRoute("/create")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create portfolio — Folio" },
      {
        name: "description",
        content: "Upload resume and photo, pick a style, and finish your live portfolio website.",
      },
    ],
  }),
  component: CreateWizard,
});

type Step = 1 | 2 | 3 | 4;

const SAMPLE_RESUME_TEXT = `Alex Rivera
Software Engineer · Full Stack Developer
San Francisco, CA · alex.rivera@example.com · github.com/alexrivera · linkedin.com/in/alexrivera

SUMMARY
Computer Science student building full-stack web applications and scalable distributed systems. Strong foundation in data structures, algorithms, and modern frontend & backend architectures.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Java, SQL, C++
Frameworks & Libraries: React, Node.js, Next.js, Express, TailwindCSS
Tools & Databases: PostgreSQL, MongoDB, Docker, Git, REST APIs, AWS, Redis

PROJECTS
CloudScale Monitoring Dashboard
Real-time microservices observability platform tracking latency, throughput, and error rates across distributed nodes.
Technologies: TypeScript · React · Node.js · Docker · PostgreSQL
Link: https://github.com/alexrivera/cloudscale

AlgoViz - Interactive Algorithm Visualizer
Web application visualizing graph traversal, sorting algorithms, and dynamic programming states with interactive step-by-step playback.
Technologies: JavaScript · React · TailwindCSS · Canvas
Link: https://github.com/alexrivera/algoviz

DevFolio Platform
Automated portfolio builder transforming student resumes into static websites deployed to GitHub Pages.
Technologies: React · Vite · TailwindCSS · Firebase
Link: https://github.com/alexrivera/devfolio

EXPERIENCE
Software Engineering Intern · Vertex Systems
June 2024 — August 2024
Designed distributed backend services, built automated data pipelines reducing batch query processing time by 35%, and created REST APIs handling 50k+ daily queries.

EDUCATION
B.S. in Computer Science · University of Technology
2021 — 2025
Data Structures & Algorithms, Distributed Systems, Database Architectures, Operating Systems.
`;

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

function CreateWizard() {
  const nav = useNavigate();
  const [builderMode, setBuilderMode] = useState<"form" | "wizard">("wizard");
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [parsingNote, setParsingNote] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateId>("paper");
  const [content, setContent] = useState<Content>(() => defaultContent());
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [resumePaste, setResumePaste] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [token, setToken] = useState("");
  const [repoName, setRepoName] = useState("my-portfolio");
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    if (s && s.user && s.user.login !== "guest") {
      const userLogin = s.user.login;
      const userName = s.user.name || userLogin;
      setContent((prev) => ({
        ...prev,
        name: prev.name || userName,
        githubUsername: prev.githubUsername || (s.provider === "github" ? userLogin : ""),
        contact: {
          ...prev.contact,
          email: prev.contact.email || s.user.email || "",
          github:
            prev.contact.github ||
            (s.provider === "github" ? `https://github.com/${userLogin}` : ""),
        },
      }));
    }
  }, []);

  async function handleDirectGoogleSignIn() {
    setBusy(true);
    try {
      const user = await signInWithGoogle();
      const resolvedLogin = resolveUsername(user.email);
      const resolvedName = resolveUserDisplayName(user.email, user.displayName);
      const newSession: AuthSession = {
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
      };
      saveSession(newSession);
      setSession(newSession);
      setContent((prev) => ({
        ...prev,
        name: prev.name || resolvedName,
        avatarUrl: prev.avatarUrl || user.photoURL || "",
        contact: {
          ...prev.contact,
          email: prev.contact.email || user.email || "",
        },
      }));
      toast.success(`Signed in as ${resolvedName}! Profile auto-filled.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        toast.info("Google sign-in window closed.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleFormGenerate(data: {
    content: Content;
    theme: Theme;
    sections: Section[];
    title: string;
  }) {
    setBusy(true);
    try {
      const s = ensureGuestSession();
      const login = s.user.login;
      const p = createPortfolio(login, {
        title: data.title || data.content.name || "My Portfolio",
      });
      updatePortfolio(login, p.id, {
        content: data.content,
        theme: data.theme,
        sections: data.sections,
        slug: p.slug,
        title: data.title || data.content.name || "My Portfolio",
      });

      if (auth.currentUser) {
        const firestoreDoc: FirebasePortfolioDoc = {
          id: p.id,
          userId: auth.currentUser.uid,
          slug: p.slug,
          title: data.title || data.content.name || "My Portfolio",
          published: true,
          github_repo: null,
          auto_push: false,
          last_pushed_at: null,
          content: data.content,
          theme: data.theme,
          sections: data.sections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await savePortfolioToFirestore(auth.currentUser.uid, firestoreDoc);
      }

      setPortfolioId(p.id);
      setContent(data.content);
      const url = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${p.slug}`;
      setLiveUrl(url);
      setStep(4);
      setBuilderMode("wizard");
      toast.success("Structured portfolio generated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  function patch(p: Partial<Content>) {
    setContent((c) => ({ ...c, ...p }));
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      patch({ avatarUrl: url });
      if (photoInputRef.current) photoInputRef.current.value = "";
      toast.success("Photo added to portfolio!");
    } catch {
      toast.error("Could not read photo");
    }
  }

  async function onResumeFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setUploadedFileName(file.name);
    setParsingNote("Reading resume file…");

    try {
      const text = await readResumeFile(file);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      if (!text.trim()) {
        toast.error("No text found in resume. Try another PDF or paste text.");
        setBusy(false);
        setParsingNote(null);
        return;
      }

      setParsingNote("Extracting skills, projects, and work experience…");
      await new Promise((r) => setTimeout(r, 400));
      applyResume(text);

      setParsingNote("Generating your website…");
      await new Promise((r) => setTimeout(r, 300));

      toast.success(`Resume imported from ${file.name}!`);
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read resume");
    } finally {
      setBusy(false);
      setParsingNote(null);
    }
  }

  function loadSampleResume() {
    setBusy(true);
    setUploadedFileName("sample_student_resume.pdf");
    setParsingNote("Applying sample student resume…");
    setTimeout(() => {
      applyResume(SAMPLE_RESUME_TEXT);
      setBusy(false);
      setParsingNote(null);
      toast.success("Sample computer science resume loaded!");
      setStep(2);
    }, 500);
  }

  function applyResume(text: string) {
    const parsed = parseResumeText(text);
    setContent((c) => {
      const next: Content = {
        ...c,
        name: parsed.name || c.name || "Alex Rivera",
        headline: parsed.headline || c.headline || "Software Engineer",
        bio: parsed.bio || c.bio,
        skills: parsed.skills?.length
          ? parsed.skills
          : c.skills.length
            ? c.skills
            : ["TypeScript", "React", "Python"],
        experience: parsed.experience?.length ? parsed.experience : c.experience,
        projects: parsed.projects?.length ? parsed.projects : c.projects,
        education: parsed.education?.length ? parsed.education : c.education,
        githubUsername: parsed.githubUsername || c.githubUsername,
        contact: {
          ...c.contact,
          email: parsed.contact?.email || c.contact.email,
          website: parsed.contact?.website || c.contact.website,
          github: parsed.contact?.github || c.contact.github,
          linkedin: parsed.contact?.linkedin || c.contact.linkedin,
          twitter: c.contact.twitter,
        },
      };

      if ((!parsed.name || next.name === "Your Name" || !next.name) && next.contact.email) {
        const local = next.contact.email.split("@")[0] || "";
        const parts = local
          .split(/[._+-]/)
          .filter((p) => p.length > 1 && !/^(data|bytes|mail|info|dev|admin)$/i.test(p));
        if (parts.length) {
          next.name = parts
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        }
      }
      return next;
    });
    setResumePaste("");
  }

  async function buildPortfolio() {
    setBusy(true);
    try {
      const s = ensureGuestSession();
      const login = s.user.login;
      const p = createPortfolio(login, { title: content.name || "My Portfolio" });
      const themeConfig = structuredClone(TEMPLATES[template].theme);

      updatePortfolio(login, p.id, {
        content,
        theme: themeConfig,
        sections: defaultSections(),
        slug: p.slug,
        title: content.name || "My Portfolio",
      });

      if (auth.currentUser) {
        const firestoreDoc: FirebasePortfolioDoc = {
          id: p.id,
          userId: auth.currentUser.uid,
          slug: p.slug,
          title: content.name || "My Portfolio",
          published: true,
          github_repo: null,
          auto_push: false,
          last_pushed_at: null,
          content,
          theme: themeConfig,
          sections: defaultSections(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await savePortfolioToFirestore(auth.currentUser.uid, firestoreDoc);
      }

      setPortfolioId(p.id);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const generatedUrl = `${origin}/p/${p.slug}`;
      setLiveUrl(generatedUrl);
      setStep(4);
      toast.success("Website finished and ready!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Build failed");
    } finally {
      setBusy(false);
    }
  }

  async function deployLiveGithub() {
    const clean = token.trim();
    if (!clean) {
      toast.error("Paste a GitHub personal access token to deploy to your GitHub Pages");
      return;
    }
    if (!portfolioId) {
      toast.error("Build the portfolio first");
      return;
    }
    setBusy(true);
    try {
      const user = await signInWithToken(clean);
      const login = user.login;
      const row = {
        id: portfolioId,
        slug: repoName,
        title: content.name || "My Portfolio",
        content,
        theme: TEMPLATES[template].theme,
        sections: defaultSections(),
        published: true,
        github_repo: repoName.trim(),
        auto_push: false,
        last_pushed_at: null as string | null,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      const result = await createRepoAndPushPortfolioHtml({
        token: clean,
        login: login === "guest" ? undefined : login,
        repoName: repoName.trim() || "my-portfolio",
        portfolio: row,
      });
      updatePortfolio(login, portfolioId, {
        github_repo: repoName.trim(),
        published: true,
        last_pushed_at: new Date().toISOString(),
        content,
      });
      setLiveUrl(result.pagesUrl);
      setToken("");
      toast.success("Live GitHub Pages website deployed!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setBusy(false);
    }
  }

  function copyLiveLink() {
    if (!liveUrl) return;
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    toast.success("Live website link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  }

  async function handleDownloadHtml() {
    setDownloadingHtml(true);
    try {
      await downloadPortfolioHtml({
        title: content.name || "My Portfolio",
        content,
        theme: TEMPLATES[template].theme,
        sections: defaultSections(),
        filename: `${(content.name || "portfolio").toLowerCase().replace(/\s+/g, "-")}-website`,
      });
      toast.success("Downloaded index.html website package!");
    } catch {
      toast.error("Failed to download HTML file");
    } finally {
      setDownloadingHtml(false);
    }
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    try {
      await downloadPortfolioPdf({
        title: content.name || "My Portfolio",
        content,
        theme: TEMPLATES[template].theme,
        sections: defaultSections(),
        filename: `${(content.name || "portfolio").toLowerCase().replace(/\s+/g, "-")}-resume`,
      });
      toast.success("Downloaded PDF portfolio!");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }

  const previewTheme = TEMPLATES[template].theme;
  const previewSections = defaultSections();
  const isLoggedIn = Boolean(session && session.user && session.user.login !== "guest");

  return (
    <div className="min-h-screen grain">
      {/* Top Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-ink/10 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-2xl font-black italic">
            Folio.
          </Link>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Resume → Live Website
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <CyberSecurityCenter triggerText="Security Shield" />
          {/* User Sign-In Status */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[140px]">
                {session?.user?.name || session?.user?.login}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDirectGoogleSignIn}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-bold text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer"
            >
              <GoogleIcon className="size-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-ink/20 bg-muted/60 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBuilderMode("wizard")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 transition-all ${
                builderMode === "wizard"
                  ? "bg-ink text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListOrdered className="size-3" /> Quick 4-Step
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode("form")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 transition-all ${
                builderMode === "form"
                  ? "bg-ink text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layout className="size-3" /> Manual Editor
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-28">
        {builderMode === "form" ? (
          <ProfessionalDetailsForm
            initialContent={content}
            initialTheme={previewTheme}
            initialSections={previewSections}
            onGenerate={handleFormGenerate}
          />
        ) : (
          <>
            {/* Step Progress Bar */}
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                <span className={step >= 1 ? "text-primary font-black" : ""}>1. Upload Resume</span>
                <span className={step >= 2 ? "text-primary font-black" : ""}>
                  2. Review Details
                </span>
                <span className={step >= 3 ? "text-primary font-black" : ""}>3. Pick Theme</span>
                <span className={step >= 4 ? "text-primary font-black" : ""}>
                  4. Finished & Live
                </span>
              </div>
              <div className="flex gap-2">
                {([1, 2, 3, 4] as Step[]).map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      s <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Upload Resume & Photo */}
            {step === 1 && (
              <section className="mx-auto max-w-2xl space-y-6 animate-in fade-in-50">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                    Upload Your Resume
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Drop your PDF resume below. Our AI processes your skills, projects, and
                    experience automatically in seconds.
                  </p>
                </div>

                {/* Google Sign-in Prompt if Not Signed In */}
                {!isLoggedIn && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-blue-950">
                    <div className="flex items-center gap-3">
                      <GoogleIcon className="size-5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold">Signing in as a student?</span>
                        <p className="text-[11px] text-blue-800">
                          Sign in with Google to sync your name & photo, and save your portfolio
                          automatically.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleDirectGoogleSignIn}
                      disabled={busy}
                      className="text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shrink-0"
                    >
                      Sign in with Google
                    </Button>
                  </div>
                )}

                {/* 1-Click Sample Helper */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        Want to test without a file?
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Load our verified sample engineering resume in 1 click.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={loadSampleResume}
                    disabled={busy}
                    className="text-xs font-bold border-primary/40 bg-card hover:bg-primary hover:text-primary-foreground"
                  >
                    ⚡ Try Sample Resume
                  </Button>
                </div>

                {/* Processing Overlay if busy */}
                {busy && (
                  <div className="rounded-2xl border-2 border-primary bg-primary/10 p-8 text-center space-y-3">
                    <Loader2 className="size-10 animate-spin text-primary mx-auto" />
                    <h3 className="text-lg font-bold text-primary">Processing Your Resume…</h3>
                    <p className="text-xs text-muted-foreground animate-pulse">
                      {parsingNote || "Extracting details and assembling your portfolio website…"}
                    </p>
                  </div>
                )}

                {!busy && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Primary Resume Upload Dropzone */}
                    <label className="sm:col-span-2 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-card p-8 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md">
                      <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary transition-transform group-hover:scale-110">
                        {uploadedFileName ? (
                          <FileCheck className="size-8 text-emerald-600" />
                        ) : (
                          <Upload className="size-8" />
                        )}
                      </div>

                      <span className="font-bold text-base text-foreground">
                        {uploadedFileName ? uploadedFileName : "Upload Resume (PDF, DOCX, TXT)"}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {uploadedFileName
                          ? "Click to replace file"
                          : "Drag and drop your file here, or click to browse"}
                      </p>

                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt,.md,application/pdf,text/plain"
                        className="hidden"
                        onChange={(e) => onResumeFile(e.target.files?.[0] ?? null)}
                      />
                    </label>

                    {/* Optional Photo Upload */}
                    <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/20 bg-card p-6 text-center transition-all hover:border-primary/50 hover:bg-muted/40">
                      {content.avatarUrl ? (
                        <div className="relative mb-2">
                          <img
                            src={content.avatarUrl}
                            alt="Avatar"
                            className="size-20 rounded-full border-2 border-primary object-cover shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              patch({ avatarUrl: "" });
                            }}
                            className="absolute -top-1 -right-1 rounded-full bg-destructive p-1 text-white shadow-xs"
                            title="Remove photo"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="mb-2 rounded-full bg-muted p-3 text-muted-foreground group-hover:text-primary transition-colors">
                          <ImagePlus className="size-6" />
                        </div>
                      )}

                      <span className="font-bold text-xs">Profile Photo</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        Optional (JPG or PNG)
                      </span>

                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                )}

                {/* Paste Text Option (Collapsible) */}
                <div className="rounded-xl border border-ink/15 bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Or Paste Resume Text Manually
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasteArea((v) => !v)}
                      className="text-xs font-semibold text-primary underline"
                    >
                      {showPasteArea ? "Hide Textarea" : "Open Paste Area"}
                    </button>
                  </div>

                  {showPasteArea && (
                    <div className="space-y-3 pt-2">
                      <Textarea
                        rows={6}
                        value={resumePaste}
                        placeholder="Paste plain resume text or markdown here…"
                        onChange={(e) => setResumePaste(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={!resumePaste.trim()}
                        onClick={() => {
                          applyResume(resumePaste);
                          toast.success("Resume text processed!");
                          setStep(2);
                        }}
                        className="font-bold"
                      >
                        Process Pasted Text →
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="text-xs text-muted-foreground"
                  >
                    Skip to manual review →
                  </Button>

                  <Button
                    type="button"
                    variant="block"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={busy}
                    className="font-bold"
                  >
                    <span>Continue to Review</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>
              </section>
            )}

            {/* STEP 2: Review & Customise with Live Preview */}
            {step === 2 && (
              <section className="grid gap-8 lg:grid-cols-2 animate-in fade-in-50">
                {/* Left: Structured Review Form */}
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black">Review & Customise</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Verify your details below. The live portfolio website on the right updates
                      instantly as you type.
                    </p>
                  </div>

                  <div className="space-y-4 rounded-xl border border-ink/20 bg-card p-5">
                    <div>
                      <Label className="font-bold mb-1 block">Full Name *</Label>
                      <Input
                        value={content.name}
                        onChange={(e) => patch({ name: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                      />
                    </div>

                    <div>
                      <Label className="font-bold mb-1 block">Headline / Role *</Label>
                      <Input
                        value={content.headline}
                        onChange={(e) => patch({ headline: e.target.value })}
                        placeholder="e.g. Software Engineer · TypeScript · React · Systems"
                      />

                      {/* Role Skill suggestions */}
                      <div className="mt-2">
                        <RoleSkillSuggestions
                          profileQuery={content.headline}
                          activeSkills={content.skills}
                          onAddSkill={(s) => {
                            if (!content.skills.includes(s)) {
                              patch({ skills: [...content.skills, s] });
                              toast.success(`Added ${s} to skills`);
                            }
                          }}
                          onAddMultipleSkills={(skills) => {
                            const combined = Array.from(new Set([...content.skills, ...skills]));
                            patch({ skills: combined });
                            toast.success(`Added ${skills.length} skills`);
                          }}
                          variant="compact"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="font-bold mb-1 block">Bio / Summary</Label>
                      <Textarea
                        rows={3}
                        value={content.bio}
                        onChange={(e) => patch({ bio: e.target.value })}
                        placeholder="Short summary about your background and engineering interests…"
                      />
                    </div>

                    <div>
                      <Label className="font-bold mb-1.5 block">
                        Skills & Tech Stack ({content.skills.length})
                      </Label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {content.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() =>
                                patch({ skills: content.skills.filter((_, i) => i !== idx) })
                              }
                              className="text-primary/60 hover:text-primary"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Email</Label>
                        <Input
                          value={content.contact.email}
                          onChange={(e) =>
                            setContent((c) => ({
                              ...c,
                              contact: { ...c.contact, email: e.target.value },
                            }))
                          }
                          placeholder="you@domain.com"
                          className="text-xs h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">GitHub Handle</Label>
                        <Input
                          value={content.githubUsername}
                          onChange={(e) => patch({ githubUsername: e.target.value })}
                          placeholder="e.g. alexrivera"
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5">
                      <ArrowLeft className="size-4" /> Back to Upload
                    </Button>
                    <Button
                      variant="block"
                      size="lg"
                      onClick={() => setStep(3)}
                      className="font-bold gap-1.5"
                    >
                      <span>Pick Theme</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Right: Sticky Live Preview */}
                <div className="sticky top-20">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Eye className="size-3.5 text-primary" /> Live Website Preview
                    </span>
                    <span className="text-[11px] text-muted-foreground">Updates in real time</span>
                  </div>
                  <LivePortfolioPreview
                    content={content}
                    theme={previewTheme}
                    sections={previewSections}
                    repos={null}
                    height="h-[620px]"
                  />
                </div>
              </section>
            )}

            {/* STEP 3: Choose Theme */}
            {step === 3 && (
              <section className="space-y-6 animate-in fade-in-50">
                <div className="mx-auto max-w-2xl text-center space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-black">Choose Your Theme</h1>
                  <p className="text-sm text-muted-foreground">
                    Select from 7 professionally crafted themes. Click any style to see your live
                    preview update instantly.
                  </p>
                </div>

                {/* Theme Cards Grid */}
                <div className="mx-auto grid max-w-4xl gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {TEMPLATE_ORDER.slice(0, 7).map((id) => {
                    const meta = TEMPLATES[id];
                    const p = meta.theme.palette;
                    const isSelected = template === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTemplate(id)}
                        className={`rounded-xl border-2 p-3 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                            : "border-ink/15 bg-card hover:border-ink/40"
                        }`}
                      >
                        <div className="mb-2.5 flex h-12 overflow-hidden rounded-lg border border-black/10">
                          <div className="flex-1" style={{ background: p.bg }} />
                          <div className="w-1/4" style={{ background: p.surface }} />
                          <div className="w-1/5" style={{ background: p.accent }} />
                          <div className="w-1/6" style={{ background: p.fg }} />
                        </div>
                        <div className="font-bold text-sm flex items-center justify-between">
                          <span>{meta.label}</span>
                          {isSelected && <Check className="size-3.5 text-primary" />}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                          {meta.blurb}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Live Preview with Theme Applied */}
                <div className="mx-auto max-w-4xl pt-2">
                  <LivePortfolioPreview
                    content={content}
                    theme={TEMPLATES[template].theme}
                    sections={previewSections}
                    repos={null}
                    height="h-[520px]"
                  />
                </div>

                {/* Step 3 Actions */}
                <div className="mx-auto flex max-w-4xl items-center justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="gap-1.5">
                    <ArrowLeft className="size-4" /> Back to Edit
                  </Button>
                  <Button
                    variant="block"
                    size="lg"
                    onClick={buildPortfolio}
                    disabled={busy}
                    className="font-bold gap-2 text-base px-6 shadow-md"
                  >
                    {busy ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Sparkles className="size-5" />
                    )}
                    <span>Finish & Build Website</span>
                  </Button>
                </div>
              </section>
            )}

            {/* STEP 4: Website Finished & Live! */}
            {step === 4 && (
              <section className="mx-auto max-w-2xl space-y-6 animate-in fade-in-50">
                {/* Big Celebration Header */}
                <div className="text-center space-y-3">
                  <div className="inline-grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50 mx-auto">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                    Your Website is Finished & Live!
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your portfolio is published and ready to share with recruiters, mentors, and on
                    your resume.
                  </p>
                </div>

                {/* Live Website URL Card */}
                {liveUrl && (
                  <div className="block-card p-6 space-y-4 border-2 border-primary/40 bg-card shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Website URL
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        HTTPS Free Public URL
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 border font-mono text-sm">
                      <span className="truncate flex-1 select-all font-semibold text-primary">
                        {liveUrl}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={copyLiveLink}
                        className="text-xs font-bold shrink-0"
                      >
                        {copiedLink ? (
                          <Check className="size-3.5 mr-1 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5 mr-1" />
                        )}
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all text-center"
                      >
                        <span>Open Live Website</span>
                        <ExternalLink className="size-4" />
                      </a>

                      <button
                        type="button"
                        onClick={copyLiveLink}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-all"
                      >
                        <Copy className="size-4" />
                        <span>Share With Recruiters</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Instant Download Options */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadHtml}
                    disabled={downloadingHtml}
                    className="font-bold py-5 border-ink/20"
                  >
                    {downloadingHtml ? (
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                    ) : (
                      <Download className="size-4 mr-1.5" />
                    )}
                    Download HTML Package
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="font-bold py-5 border-ink/20"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                    ) : (
                      <Download className="size-4 mr-1.5" />
                    )}
                    Download PDF Portfolio
                  </Button>
                </div>

                {/* Account Saved Status */}
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    {isLoggedIn ? (
                      <div>
                        <span className="font-bold text-foreground">Saved to Google Account</span>
                        <p className="text-muted-foreground">
                          Logged in as {session?.user?.email || session?.user?.name}. Manage all
                          your sites from your Dashboard.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-foreground">
                          Saved locally in this browser
                        </span>
                        <p className="text-muted-foreground">
                          Sign in with Google to permanently save this site and access it from any
                          computer.
                        </p>
                      </div>
                    )}
                  </div>
                  {isLoggedIn ? (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="font-bold text-xs shrink-0"
                    >
                      <Link to="/dashboard">Go to Dashboard →</Link>
                    </Button>
                  ) : (
                    <Link
                      to="/auth"
                      search={{ redirect: "/dashboard" }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-bold text-foreground shrink-0 hover:bg-muted"
                    >
                      <GoogleIcon className="size-3.5" />
                      <span>Sign in with Google</span>
                    </Link>
                  )}
                </div>

                {/* Optional GitHub Pages Section (Non-blocking) */}
                <div className="rounded-xl border border-ink/15 bg-card p-4 space-y-3">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Upload className="size-3.5 text-primary" />
                        <span>
                          Optional: Also Deploy to your Personal GitHub Pages (.github.io)
                        </span>
                      </span>
                      <span className="group-open:rotate-180 transition-transform text-[10px]">
                        ▼
                      </span>
                    </summary>

                    <div className="space-y-3 pt-3 mt-2 border-t text-xs">
                      <p className="text-muted-foreground">
                        Your website is already live on the link above. If you also want it hosted
                        on your personal GitHub Pages repo (e.g.{" "}
                        <code>username.github.io/my-portfolio</code>), enter a GitHub token:
                      </p>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs mb-1 block">
                            GitHub Personal Access Token (classic with repo scope)
                          </Label>
                          <Input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Repository Name</Label>
                          <Input
                            value={repoName}
                            onChange={(e) =>
                              setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-"))
                            }
                            placeholder="my-portfolio"
                            className="text-xs"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={deployLiveGithub}
                          disabled={busy || !token.trim()}
                          className="font-bold w-full"
                        >
                          {busy ? (
                            <Loader2 className="size-3.5 animate-spin mr-1.5" />
                          ) : (
                            <Upload className="size-3.5 mr-1.5" />
                          )}
                          Deploy to GitHub Pages
                        </Button>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep(1);
                      setLiveUrl(null);
                      setUploadedFileName(null);
                    }}
                    className="text-xs gap-1.5"
                  >
                    <RotateCcw className="size-3.5" /> Create Another Website
                  </Button>
                  <Button asChild variant="outline" className="font-bold text-xs">
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
