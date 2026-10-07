import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  ImagePlus,
  Layout,
  ListOrdered,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { PortfolioView } from "@/components/PortfolioView";
import { ProfessionalDetailsForm } from "@/components/ProfessionalDetailsForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureGuestSession, signInWithToken, loadSession } from "@/lib/auth";
import { publishPortfolio } from "@/lib/github-client";
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
import { createPortfolio, updatePortfolio, upsertPortfolio } from "@/lib/storage";
import { auth, savePortfolioToFirestore, type FirebasePortfolioDoc } from "@/lib/firebase";

export const Route = createFileRoute("/create")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create portfolio — Folio" },
      {
        name: "description",
        content: "Choose from 7 themes. Upload resume and photo. Deploy a live portfolio.",
      },
    ],
  }),
  component: CreateWizard,
});

type Step = 1 | 2 | 3 | 4;

function CreateWizard() {
  const nav = useNavigate();
  const [builderMode, setBuilderMode] = useState<"form" | "wizard">("form");
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("signal");
  const [content, setContent] = useState<Content>(() => defaultContent());
  const [resumeNote, setResumeNote] = useState("");
  const [resumePaste, setResumePaste] = useState("");
  const [token, setToken] = useState("");
  const [repoName, setRepoName] = useState("my-portfolio");
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  async function handleFormGenerate(data: {
    content: Content;
    theme: Theme;
    sections: Section[];
    title: string;
  }) {
    setBusy(true);
    try {
      const session = ensureGuestSession();
      const login = session.user.login;
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

      // Also sync to Firebase if user is logged in
      if (auth.currentUser) {
        const firestoreDoc: FirebasePortfolioDoc = {
          id: p.id,
          userId: auth.currentUser.uid,
          slug: p.slug,
          title: data.title || data.content.name || "My Portfolio",
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
        await savePortfolioToFirestore(auth.currentUser.uid, firestoreDoc);
      }

      setPortfolioId(p.id);
      setContent(data.content);
      toast.success("Structured portfolio generated!");
      nav({ to: "/editor/$id", params: { id: p.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  function patch(p: Partial<Content>) {
    setContent((c) => ({ ...c, ...p }));
  }
  function patchContact(key: keyof Content["contact"], value: string) {
    setContent((c) => ({ ...c, contact: { ...c.contact, [key]: value } }));
  }

  function wipeUploadMemory() {
    setResumePaste("");
    setResumeNote("");
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (resumeInputRef.current) resumeInputRef.current.value = "";
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
      toast.success("Photo added");
    } catch {
      toast.error("Could not read photo");
    }
  }

  async function onResumeFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const text = await readResumeFile(file);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      if (!text.trim()) {
        setResumeNote("Could not read text from that file. Try another PDF or paste text.");
        toast.error("No text found in resume");
        return;
      }
      applyResume(text);
      setResumeNote(`Imported from ${file.name} — check the live preview on the next step.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read resume");
      setResumeNote("PDF read failed. Paste resume text instead.");
    } finally {
      setBusy(false);
    }
  }

  function applyResume(text: string) {
    const parsed = parseResumeText(text);
    setContent((c) => {
      const next: Content = {
        ...c,
        name: parsed.name || c.name,
        headline: parsed.headline || c.headline,
        bio: parsed.bio || c.bio,
        skills: parsed.skills?.length ? parsed.skills : c.skills,
        experience: parsed.experience?.length ? parsed.experience : c.experience,
        projects: parsed.projects?.length ? parsed.projects : c.projects,
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
      if ((!parsed.name || next.name === "Your Name") && next.contact.email) {
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
    toast.success("Resume applied to portfolio");
  }

  async function buildPortfolio() {
    setBusy(true);
    try {
      const session = ensureGuestSession();
      const login = session.user.login;
      const p = createPortfolio(login, { title: content.name || "My Portfolio" });
      const theme = structuredClone(TEMPLATES[template].theme);
      updatePortfolio(login, p.id, {
        content,
        theme,
        sections: defaultSections(),
        slug: p.slug,
        title: content.name || "My Portfolio",
      });
      setPortfolioId(p.id);
      wipeUploadMemory();
      setStep(4);
      toast.success("Portfolio built");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Build failed");
    }
    setBusy(false);
  }

  async function deployLive() {
    const clean = token.trim();
    if (!clean) {
      toast.error("Paste a GitHub token to deploy a live URL");
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
      const guestList = JSON.parse(localStorage.getItem("folio_portfolios_guest") || "[]");
      const guestRow = Array.isArray(guestList)
        ? guestList.find((x: { id: string }) => x.id === portfolioId)
        : null;
      if (guestRow) {
        const key = `folio_portfolios_${login.toLowerCase()}`;
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const list = Array.isArray(existing) ? existing : [];
        if (!list.some((x: { id: string }) => x.id === portfolioId)) {
          list.unshift({ ...guestRow, content, updated_at: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(list));
        }
      }
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
      const result = await publishPortfolio({
        token: clean,
        login,
        repo: repoName.trim() || "my-portfolio",
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
      wipeUploadMemory();
      toast.success("Live website deployed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deploy failed");
    }
    setBusy(false);
  }

  const previewTheme = TEMPLATES[template].theme;
  const previewSections = defaultSections();

  return (
    <div className="min-h-screen grain">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border-2 border-ink bg-muted/40 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBuilderMode("form")}
              className={`flex items-center gap-1.5 rounded px-3 py-1 transition-all ${
                builderMode === "form"
                  ? "bg-ink text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layout className="size-3.5" /> Professional Form
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode("wizard")}
              className={`flex items-center gap-1.5 rounded px-3 py-1 transition-all ${
                builderMode === "wizard"
                  ? "bg-ink text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListOrdered className="size-3.5" /> 4-Step Wizard
            </button>
          </div>
          {builderMode === "wizard" && (
            <span className="text-sm font-semibold text-muted-foreground">Step {step} of 4</span>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {builderMode === "form" ? (
          <ProfessionalDetailsForm
            initialContent={content}
            initialTheme={previewTheme}
            initialSections={previewSections}
            onGenerate={handleFormGenerate}
          />
        ) : (
          <>
            <div className="mx-auto mb-8 flex max-w-2xl gap-2">
              {([1, 2, 3, 4] as Step[]).map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>

            {step === 1 && (
              <section className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-4xl font-black">Your details</h1>
                <p className="text-muted-foreground">
                  Upload a PDF resume — we fill the portfolio fields. Everything stays in your
                  browser.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block-card flex cursor-pointer flex-col items-center gap-2 p-6 text-center hover:bg-muted/40">
                    <ImagePlus className="size-8 text-primary" />
                    <span className="font-semibold">Upload photo</span>
                    <span className="text-xs text-muted-foreground">JPG or PNG</span>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
                    />
                    {content.avatarUrl ? (
                      <img
                        src={content.avatarUrl}
                        alt=""
                        className="mt-2 size-20 rounded-full border-2 border-ink object-cover"
                      />
                    ) : null}
                  </label>

                  <label className="block-card flex cursor-pointer flex-col items-center gap-2 p-6 text-center hover:bg-muted/40">
                    <FileText className="size-8 text-primary" />
                    <span className="font-semibold">Upload resume</span>
                    <span className="text-xs text-muted-foreground">PDF, .txt, or .md</span>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.txt,.md,.csv,application/pdf,text/plain"
                      className="hidden"
                      onChange={(e) => onResumeFile(e.target.files?.[0] ?? null)}
                    />
                    {busy ? <Loader2 className="mt-2 size-5 animate-spin" /> : null}
                  </label>
                </div>

                <div>
                  <Label className="mb-1 block">Or paste resume text</Label>
                  <Textarea
                    rows={6}
                    value={resumePaste}
                    placeholder="Paste your resume / CV text here…"
                    onChange={(e) => setResumePaste(e.target.value)}
                    onBlur={() => {
                      if (resumePaste.trim().length > 40) applyResume(resumePaste);
                    }}
                  />
                  {resumeNote ? (
                    <p className="mt-2 text-sm text-muted-foreground">{resumeNote}</p>
                  ) : null}
                </div>

                <div className="flex justify-end">
                  <Button variant="block" onClick={() => setStep(2)} disabled={busy}>
                    Next <ArrowRight />
                  </Button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-5">
                  <h1 className="text-4xl font-black">Review details</h1>
                  <p className="text-muted-foreground">
                    Edit fields on the left — the portfolio on the right updates immediately.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <Label className="mb-1 block">Full name</Label>
                      <Input
                        value={content.name}
                        onChange={(e) => patch({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Headline</Label>
                      <Input
                        value={content.headline}
                        onChange={(e) => patch({ headline: e.target.value })}
                        placeholder="e.g. Frontend developer"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">About you</Label>
                      <Textarea
                        rows={4}
                        value={content.bio}
                        onChange={(e) => patch({ bio: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Skills (comma separated)</Label>
                      <Input
                        value={content.skills.join(", ")}
                        onChange={(e) =>
                          patch({
                            skills: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Email</Label>
                      <Input
                        value={content.contact.email}
                        onChange={(e) => patchContact("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">GitHub username (optional)</Label>
                      <Input
                        value={content.githubUsername}
                        onChange={(e) => patch({ githubUsername: e.target.value.trim() })}
                        placeholder="your-handle"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft /> Back
                    </Button>
                    <Button
                      variant="block"
                      onClick={() => setStep(3)}
                      disabled={!content.name.trim()}
                    >
                      Next <ArrowRight />
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border-2 border-ink bg-card shadow-sm">
                  <div className="border-b-2 border-ink bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Live website preview
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto">
                    <PortfolioView
                      content={content}
                      theme={previewTheme}
                      sections={previewSections}
                      repos={null}
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-6">
                <div className="mx-auto max-w-3xl text-center">
                  <h1 className="text-4xl font-black">Pick a theme</h1>
                  <p className="mt-2 text-muted-foreground">
                    Seven styles — click one to preview, then build.
                  </p>
                </div>

                <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {TEMPLATE_ORDER.map((id) => {
                    const meta = TEMPLATES[id];
                    const p = meta.theme.palette;
                    const selected = template === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTemplate(id)}
                        className={`rounded-xl border-2 p-4 text-left transition ${
                          selected
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-ink/15 hover:border-ink/40"
                        }`}
                      >
                        <div
                          className="mb-3 flex h-14 overflow-hidden rounded-lg border border-black/10"
                          aria-hidden
                        >
                          <div className="flex-1" style={{ background: p.bg }} />
                          <div className="w-1/4" style={{ background: p.surface }} />
                          <div className="w-1/5" style={{ background: p.accent }} />
                          <div className="w-1/6" style={{ background: p.fg }} />
                        </div>
                        <div className="font-bold">{meta.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{meta.blurb}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border-2 border-ink">
                  <div className="border-b-2 border-ink bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Preview · {TEMPLATES[template].label}
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto">
                    <PortfolioView
                      content={content}
                      theme={TEMPLATES[template].theme}
                      sections={previewSections}
                      repos={null}
                    />
                  </div>
                </div>

                <div className="mx-auto flex max-w-3xl justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft /> Back
                  </Button>
                  <Button variant="block" onClick={buildPortfolio} disabled={busy}>
                    {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Build my portfolio
                  </Button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-accent">
                    <Check className="size-5" />
                  </div>
                  <h1 className="text-4xl font-black">Portfolio ready</h1>
                </div>
                <p className="text-muted-foreground">
                  Theme: <strong>{TEMPLATES[template].label}</strong>. Deploy to GitHub Pages for a
                  public URL.
                </p>

                {liveUrl ? (
                  <div className="block-card space-y-3 p-6">
                    <p className="font-semibold">Live website</p>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-primary underline"
                    >
                      {liveUrl}
                    </a>
                  </div>
                ) : (
                  <div className="block-card space-y-4 p-6">
                    <p className="font-semibold">Deploy live (free GitHub Pages)</p>
                    <p className="text-sm text-muted-foreground">
                      Token:{" "}
                      <a
                        className="underline"
                        href="https://github.com/settings/tokens/new?scopes=repo&description=Folio"
                        target="_blank"
                        rel="noreferrer"
                      >
                        github.com/settings/tokens
                      </a>{" "}
                      (<strong>repo</strong> scope).
                    </p>
                    <div>
                      <Label className="mb-1 block">GitHub token</Label>
                      <Input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="ghp_…"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Site name (repo)</Label>
                      <Input
                        value={repoName}
                        onChange={(e) =>
                          setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-"))
                        }
                        placeholder="my-portfolio"
                      />
                    </div>
                    <Button variant="block" className="w-full" onClick={deployLive} disabled={busy}>
                      {busy ? <Loader2 className="animate-spin" /> : <Upload />}
                      Deploy website
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {portfolioId ? (
                    <Button asChild variant="blockOutline">
                      <Link to="/editor/$id" params={{ id: portfolioId }}>
                        Edit design
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="ghost">
                    <Link to="/dashboard">Dashboard</Link>
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
