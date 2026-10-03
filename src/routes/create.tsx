import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Globe,
  ImagePlus,
  Linkedin,
  Loader2,
  MapPin,
  Sparkles,
  Twitter,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { PortfolioView } from "@/components/PortfolioView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureGuestSession, signInWithToken } from "@/lib/auth";
import { publishPortfolio } from "@/lib/github-client";
import {
  defaultContent,
  defaultSections,
  TEMPLATE_ORDER,
  TEMPLATES,
  type Content,
  type TemplateId,
} from "@/lib/portfolio";
import { fileToDataUrl, parseResumeText, readResumeFile } from "@/lib/resume-parse";
import { createPortfolio, updatePortfolio } from "@/lib/storage";

export const Route = createFileRoute("/create")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create portfolio — Folio" },
      {
        name: "description",
        content: "Choose from 7 themes. Upload resume and photo. Deploy a live portfolio in minutes.",
      },
    ],
  }),
  component: CreateWizard,
});

type Step = 1 | 2 | 3 | 4;

function StepIndicator({ current }: { current: Step }) {
  const labels = ["Details", "Review", "Theme", "Deploy"];
  return (
    <div className="mx-auto mb-10 max-w-2xl">
      <div className="flex items-center gap-0">
        {([1, 2, 3, 4] as Step[]).map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
              s < current
                ? "border-primary bg-primary text-primary-foreground"
                : s === current
                  ? "border-primary text-primary"
                  : "border-ink/20 text-muted-foreground"
            }`}>
              {s < current ? <Check className="size-3.5" /> : s}
            </div>
            {i < 3 && (
              <div className={`h-0.5 flex-1 transition-all ${s < current ? "bg-primary" : "bg-ink/10"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex">
        {labels.map((l, i) => (
          <div key={l} className={`flex-1 text-center text-xs font-medium ${i + 1 === current ? "text-primary" : "text-muted-foreground"}`}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateWizard() {
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
      toast.success("Photo added ✓");
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
      setResumeNote(`✓ Imported from ${file.name} — review on the next step.`);
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
    toast.success("Resume applied ✓");
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
      toast.success("Portfolio built ✓");
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
      toast.success("🎉 Live website deployed!");
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
        <span className="text-sm text-muted-foreground hidden sm:block">Create your portfolio</span>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <StepIndicator current={step} />

        {step === 1 && (
          <section className="mx-auto max-w-2xl space-y-8">
            <div>
              <h1 className="text-4xl font-black">Your details</h1>
              <p className="mt-2 text-muted-foreground">
                Upload a photo and PDF resume — we'll fill in your portfolio automatically. Everything stays in your browser.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block-card group flex cursor-pointer flex-col items-center gap-3 p-8 text-center hover:bg-muted/40 transition-colors">
                <div className={`grid size-14 place-items-center rounded-xl transition-colors ${content.avatarUrl ? "bg-accent" : "bg-primary/10"}`}>
                  <ImagePlus className={`size-7 ${content.avatarUrl ? "" : "text-primary"}`} />
                </div>
                <div>
                  <p className="font-bold">{content.avatarUrl ? "Photo uploaded ✓" : "Upload photo"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG · optional</p>
                </div>
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
                    className="size-20 rounded-full border-2 border-ink object-cover"
                  />
                ) : null}
              </label>

              <label className="block-card group flex cursor-pointer flex-col items-center gap-3 p-8 text-center hover:bg-muted/40 transition-colors">
                <div className={`grid size-14 place-items-center rounded-xl transition-colors ${resumeNote.startsWith("✓") ? "bg-accent" : "bg-primary/10"}`}>
                  {busy ? <Loader2 className="size-7 animate-spin text-primary" /> : <FileText className={`size-7 ${resumeNote.startsWith("✓") ? "" : "text-primary"}`} />}
                </div>
                <div>
                  <p className="font-bold">{resumeNote.startsWith("✓") ? "Resume imported ✓" : "Upload resume"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">PDF, .txt, or .md · optional</p>
                </div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.csv,application/pdf,text/plain"
                  className="hidden"
                  onChange={(e) => onResumeFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {resumeNote && (
              <p className={`text-sm ${resumeNote.startsWith("✓") ? "text-primary font-medium" : "text-muted-foreground"}`}>{resumeNote}</p>
            )}

            <div>
              <Label className="mb-1 block">Or paste resume text</Label>
              <Textarea
                rows={7}
                value={resumePaste}
                placeholder="Paste your resume / CV text here…&#10;&#10;We'll extract your name, skills, experience, and projects automatically."
                onChange={(e) => setResumePaste(e.target.value)}
                onBlur={() => {
                  if (resumePaste.trim().length > 40) applyResume(resumePaste);
                }}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">You can also fill everything in manually on the next step.</p>
              <Button variant="block" onClick={() => setStep(2)} disabled={busy}>
                Next <ArrowRight />
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5 overflow-y-auto max-h-[80vh] pr-2">
              <div>
                <h1 className="text-4xl font-black">Review details</h1>
                <p className="mt-2 text-muted-foreground">
                  Edit your details on the left — the preview updates in real time.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 block">Full name *</Label>
                  <Input value={content.name} onChange={(e) => patch({ name: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1 block">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      value={content.location}
                      onChange={(e) => patch({ location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-1 block">Headline</Label>
                <Input
                  value={content.headline}
                  onChange={(e) => patch({ headline: e.target.value })}
                  placeholder="e.g. Full-Stack Engineer · React · Node.js"
                />
              </div>

              <div>
                <Label className="mb-1 block">About / bio</Label>
                <Textarea
                  rows={4}
                  value={content.bio}
                  onChange={(e) => patch({ bio: e.target.value })}
                  placeholder="A short paragraph about yourself…"
                />
              </div>

              <div>
                <Label className="mb-1 block">Skills <span className="text-muted-foreground">(comma separated)</span></Label>
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
                  placeholder="React, TypeScript, Python, AWS…"
                />
              </div>

              <div className="space-y-2">
                <Label className="block">Contact links</Label>
                <Input
                  value={content.contact.email}
                  onChange={(e) => patchContact("email", e.target.value)}
                  placeholder="Email address"
                  type="email"
                />
                <Input
                  value={content.githubUsername}
                  onChange={(e) => patch({ githubUsername: e.target.value.trim() })}
                  placeholder="GitHub username (e.g. octocat)"
                />
                <div className="relative">
                  <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={content.contact.linkedin}
                    onChange={(e) => patchContact("linkedin", e.target.value)}
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div className="relative">
                  <Twitter className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={content.contact.twitter}
                    onChange={(e) => patchContact("twitter", e.target.value)}
                    placeholder="Twitter / X URL or @handle"
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={content.contact.website}
                    onChange={(e) => patchContact("website", e.target.value)}
                    placeholder="Personal website URL"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft /> Back
                </Button>
                <Button variant="block" onClick={() => setStep(3)} disabled={!content.name.trim()}>
                  Next <ArrowRight />
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-ink bg-card shadow-sm hidden lg:block">
              <div className="border-b-2 border-ink bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Live preview
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
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
          <section className="space-y-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-black">Pick a theme</h1>
              <p className="mt-2 text-muted-foreground">
                7 professionally crafted styles. Click one to preview, then build your portfolio.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {TEMPLATE_ORDER.map((id) => {
                const meta = TEMPLATES[id];
                const p = meta.theme.palette;
                const selected = template === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTemplate(id)}
                    className={`rounded-xl border-2 p-3 text-left transition-all hover:scale-[1.02] ${
                      selected
                        ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                        : "border-ink/15 hover:border-ink/40"
                    }`}
                  >
                    <div
                      className="mb-2 flex h-12 overflow-hidden rounded-lg border border-black/10"
                      aria-hidden
                    >
                      <div className="flex-1" style={{ background: p.bg }} />
                      <div className="w-1/4" style={{ background: p.surface }} />
                      <div className="w-1/5" style={{ background: p.accent }} />
                      <div className="w-1/6" style={{ background: p.fg }} />
                    </div>
                    <div className="text-xs font-bold">{meta.label}</div>
                    {selected && <div className="mt-0.5 text-[10px] text-primary font-medium">Selected ✓</div>}
                  </button>
                );
              })}
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border-2 border-ink">
              <div className="flex items-center justify-between border-b-2 border-ink bg-muted/40 px-4 py-2">
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
                    <div key={c} className={`size-2.5 rounded-full ${c}`} />
                  ))}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Preview · {TEMPLATES[template].label}
                </span>
                <div />
              </div>
              <div className="max-h-[55vh] overflow-y-auto">
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
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full bg-accent border-2 border-ink">
                <Check className="size-6" />
              </div>
              <div>
                <h1 className="text-4xl font-black">Portfolio ready!</h1>
                <p className="text-muted-foreground">Theme: <strong>{TEMPLATES[template].label}</strong></p>
              </div>
            </div>

            {liveUrl ? (
              <div className="block-card space-y-4 bg-accent/20 p-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Check className="size-5 text-primary" /> Live on GitHub Pages
                </div>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary underline font-medium"
                >
                  {liveUrl}
                </a>
                <p className="text-sm text-muted-foreground">
                  It may take 1–2 minutes for GitHub Pages to go live. Share this URL anywhere!
                </p>
              </div>
            ) : (
              <div className="block-card space-y-4 p-6">
                <div className="flex items-center gap-2 font-bold">
                  <Upload className="size-5" /> Deploy live — free GitHub Pages
                </div>
                <p className="text-sm text-muted-foreground">
                  Create a token at{" "}
                  <a
                    className="underline text-primary"
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Folio"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/settings/tokens
                  </a>{" "}
                  with the <strong>repo</strong> scope. It stays in your browser only.
                </p>
                <div>
                  <Label className="mb-1 block">GitHub token</Label>
                  <Input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_… or github_pat_…"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Repository name</Label>
                  <Input
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-"))}
                    placeholder="my-portfolio"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your site will be at <code>{`<your-username>.github.io/${repoName || "my-portfolio"}`}</code>
                  </p>
                </div>
                <Button variant="block" className="w-full" onClick={deployLive} disabled={busy || !token.trim()}>
                  {busy ? <Loader2 className="animate-spin" /> : <Upload />}
                  Deploy to GitHub Pages
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {portfolioId ? (
                <Button asChild variant="block">
                  <Link to="/editor/$id" params={{ id: portfolioId }}>
                    Open editor <ArrowRight />
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="blockOutline">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/">Home</Link>
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
