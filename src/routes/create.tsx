import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { ensureGuestSession, loadSession, signInWithToken } from "@/lib/auth";
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
        content: "Enter your details, add a photo and resume, get a live portfolio website.",
      },
    ],
  }),
  component: CreateWizard,
});

type Step = 1 | 2 | 3 | 4;

function CreateWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("editorial");
  const [content, setContent] = useState<Content>(() => defaultContent());
  const [resumeNote, setResumeNote] = useState("");
  const [token, setToken] = useState("");
  const [repoName, setRepoName] = useState("my-portfolio");
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  function patch(p: Partial<Content>) {
    setContent((c) => ({ ...c, ...p }));
  }
  function patchContact(key: keyof Content["contact"], value: string) {
    setContent((c) => ({ ...c, contact: { ...c.contact, [key]: value } }));
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
      toast.success("Photo added");
    } catch {
      toast.error("Could not read photo");
    }
  }

  async function onResumeFile(file: File | null) {
    if (!file) return;
    const text = await readResumeFile(file);
    if (!text) {
      setResumeNote(
        "PDF text can’t be read in the browser. Paste your resume text below, or upload a .txt / .md file.",
      );
      toast.message("Paste resume text for PDF files");
      return;
    }
    applyResume(text);
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
    setResumeNote("Resume applied — review details on the next step.");
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
      // Migrate guest portfolio into signed-in key if needed
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
      toast.success("Live website deployed");
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
              Add a photo and resume — we’ll fill most fields for you.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block-card flex cursor-pointer flex-col items-center gap-2 p-6 text-center hover:bg-muted/40">
                <ImagePlus className="size-8 text-primary" />
                <span className="font-semibold">Upload photo</span>
                <span className="text-xs text-muted-foreground">JPG or PNG</span>
                <input
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
                <span className="text-xs text-muted-foreground">.txt or .md (paste PDF text below)</span>
                <input
                  type="file"
                  accept=".txt,.md,.csv,text/plain"
                  className="hidden"
                  onChange={(e) => onResumeFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div>
              <Label className="mb-1 block">Or paste resume text</Label>
              <Textarea
                rows={6}
                placeholder="Paste your resume / CV text here…"
                onBlur={(e) => {
                  if (e.target.value.trim().length > 40) applyResume(e.target.value);
                }}
              />
              {resumeNote ? <p className="mt-2 text-sm text-muted-foreground">{resumeNote}</p> : null}
            </div>

            <div className="flex justify-end">
              <Button variant="block" onClick={() => setStep(2)}>
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
              Your site is built from your details, photo, and resume. Deploy it to get a public
              link anyone can open.
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
                  GitHub Pages can take 1–2 minutes the first time. Refresh if you see 404.
                </p>
              </div>
            ) : (
              <div className="block-card space-y-4 p-6">
                <p className="font-semibold">Deploy live (free GitHub Pages)</p>
                <p className="text-sm text-muted-foreground">
                  Create a token at{" "}
                  <a
                    className="underline"
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Folio%20portfolio"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/settings/tokens
                  </a>{" "}
                  with the <strong>repo</strong> scope, paste it once, and we publish your site.
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
