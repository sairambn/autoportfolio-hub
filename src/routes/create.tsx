import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureGuestSession, signInWithToken } from "@/lib/auth";
import { publishPortfolio } from "@/lib/github-client";
import {
  defaultContent,
  defaultSections,
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
        content:
          "Upload photo and PDF resume in your browser. Nothing is stored on our servers.",
      },
    ],
  }),
  component: CreateWizard,
});

type Step = 1 | 2 | 3 | 4;

function CreateWizard() {
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("editorial");
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

  /** Drop file inputs + paste buffer so PDF/bytes are not kept in the UI. */
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
      toast.success("Photo added (kept only in this browser until you deploy)");
    } catch {
      toast.error("Could not read photo");
    }
  }

  async function onResumeFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const text = await readResumeFile(file);
      // Clear file input immediately — PDF bytes leave the input
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      if (!text.trim()) {
        setResumeNote("Could not read text from that file. Try another PDF or paste text.");
        toast.error("No text found in resume");
        return;
      }
      applyResume(text);
      setResumeNote(
        `Imported from ${file.name} in your browser only — file was not uploaded to our servers.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read resume");
      setResumeNote("PDF read failed. Paste resume text instead.");
    } finally {
      setBusy(false);
    }
  }

  function applyResume(text: string) {
    const parsed = parseResumeText(text);
    setContent((c) => ({
      ...c,
      name: parsed.name || c.name,
      headline: parsed.headline || c.headline,
      bio: parsed.bio || c.bio,
      skills: parsed.skills?.length ? parsed.skills : c.skills,
      experience: parsed.experience?.length ? parsed.experience : c.experience,
      projects: parsed.projects?.length ? parsed.projects : c.projects,
      githubUsername: parsed.githubUsername || c.githubUsername,
      contact: { ...c.contact, ...(parsed.contact ?? {}) },
    }));
    // Do not keep full resume text in state after parse
    setResumePaste("");
    toast.success("Resume imported");
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
      // Drop resume paste / file handles from memory after build
      wipeUploadMemory();
      setStep(4);
      toast.success("Portfolio built — upload data cleared from this form");
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
      // Token and upload leftovers leave form memory after successful deploy
      setToken("");
      wipeUploadMemory();
      toast.success("Live website deployed — token cleared from this page");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deploy failed");
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen grain">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <span className="text-sm text-muted-foreground">Step {step} of 4</span>
      </nav>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        <div className="mb-8 flex gap-2">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <section className="space-y-6">
            <h1 className="text-4xl font-black">Your details</h1>
            <p className="text-muted-foreground">
              Photo and PDF are read <strong>only in your browser</strong>. Nothing is stored on
              Vercel — after you build, upload data is cleared from this form.
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
          <section className="space-y-5">
            <h1 className="text-4xl font-black">Review details</h1>
            <p className="text-muted-foreground">Edit anything that looks wrong.</p>

            <div className="space-y-3">
              <div>
                <Label className="mb-1 block">Full name</Label>
                <Input value={content.name} onChange={(e) => patch({ name: e.target.value })} />
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
                <Textarea rows={4} value={content.bio} onChange={(e) => patch({ bio: e.target.value })} />
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

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft /> Back
              </Button>
              <Button variant="block" onClick={() => setStep(3)} disabled={!content.name.trim()}>
                Next <ArrowRight />
              </Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6">
            <h1 className="text-4xl font-black">Pick a style</h1>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(TEMPLATES) as TemplateId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplate(id)}
                  className={`rounded-md border-2 p-4 text-left font-semibold capitalize ${
                    template === id ? "border-primary bg-primary/10" : "border-ink/20"
                  }`}
                >
                  {TEMPLATES[id].label}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
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
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-accent">
                <Check className="size-5" />
              </div>
              <h1 className="text-4xl font-black">Portfolio ready</h1>
            </div>
            <p className="text-muted-foreground">
              PDF/photo were processed in your browser only. Deploy to GitHub Pages for a free
              public URL — we do not host your files on Vercel.
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
                <p className="text-xs text-muted-foreground">
                  Hosted on GitHub Pages (free). First load can take 1–2 minutes.
                </p>
              </div>
            ) : (
              <div className="block-card space-y-4 p-6">
                <p className="font-semibold">Deploy live (free GitHub Pages)</p>
                <p className="text-sm text-muted-foreground">
                  Token at{" "}
                  <a
                    className="underline"
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Folio%20portfolio"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/settings/tokens
                  </a>{" "}
                  (<strong>repo</strong> scope). Cleared from this page after deploy.
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
                    onChange={(e) => setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-"))}
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
      </main>
    </div>
  );
}
