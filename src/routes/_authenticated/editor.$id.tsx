import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  Palette,
  Plus,
  Save,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PortfolioView } from "@/components/PortfolioView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useGithubRepos } from "@/hooks/use-github-repos";
import { publishPortfolio } from "@/lib/github-client";
import {
  TEMPLATE_ORDER,
  TEMPLATES,
  type Content,
  type EducationItem,
  type ExperienceItem,
  type ProjectItem,
  type TemplateId,
  type Theme,
} from "@/lib/portfolio";
import { renderPortfolioHtml } from "@/lib/export-html";
import { fileToDataUrl } from "@/lib/resume-parse";
import { getPortfolio, updatePortfolio, type PortfolioRecord } from "@/lib/storage";
import { auth, savePortfolioToFirestore, type FirebasePortfolioDoc } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated/editor/$id")({
  head: () => ({
    meta: [
      { title: "Portfolio Editor — Folio" },
      { name: "description", content: "Edit your portfolio content and design in real-time." },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  const { id } = Route.useParams();
  const { session } = Route.useRouteContext();
  const nav = useNavigate();
  const login = session.user.login;

  const [record, setRecord] = useState<PortfolioRecord | null>(() => getPortfolio(login, id));
  const [content, setContent] = useState<Content | null>(() => record?.content ?? null);
  const [theme, setTheme] = useState<Theme | null>(() => record?.theme ?? null);
  const [title, setTitle] = useState(record?.title ?? "My Portfolio");
  const [newSkill, setNewSkill] = useState("");
  const [busy, setBusy] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [repoName, setRepoName] = useState(record?.github_repo ?? "my-portfolio");
  const [activeTab, setActiveTab] = useState("content");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = getPortfolio(login, id);
    if (!r) {
      toast.error("Portfolio not found");
      nav({ to: "/dashboard" });
      return;
    }
    setRecord(r);
    setContent(r.content);
    setTheme(r.theme);
    setTitle(r.title);
    if (r.github_repo) setRepoName(r.github_repo);
  }, [login, id, nav]);

  const repos = useGithubRepos(content?.githubUsername);

  if (!record || !content || !theme) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  async function handleSave() {
    if (!content || !theme) return;
    const updated = updatePortfolio(login, id, {
      title,
      content,
      theme,
    });
    if (updated) {
      setRecord(updated);
      if (auth.currentUser) {
        const firestoreDoc: FirebasePortfolioDoc = {
          id: updated.id,
          userId: auth.currentUser.uid,
          slug: updated.slug,
          title: updated.title,
          published: !!updated.published,
          github_repo: updated.github_repo || null,
          auto_push: !!updated.auto_push,
          last_pushed_at: updated.last_pushed_at || null,
          content: updated.content,
          theme: updated.theme,
          sections: updated.sections,
          createdAt: updated.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await savePortfolioToFirestore(auth.currentUser.uid, firestoreDoc);
        } catch (e) {
          console.error("Failed to sync to Firestore:", e);
        }
      }
      toast.success("Changes saved successfully");
    }
  }

  function patchContent(patch: Partial<Content>) {
    setContent((c) => (c ? { ...c, ...patch } : null));
  }

  function patchContact(key: keyof Content["contact"], value: string) {
    setContent((c) => (c ? { ...c, contact: { ...c.contact, [key]: value } } : null));
  }

  function selectTemplate(tid: TemplateId) {
    const t = TEMPLATES[tid];
    setTheme(structuredClone(t.theme));
    toast.success(`Applied ${t.label} theme`);
  }

  function addSkill() {
    const s = newSkill.trim();
    if (!s || !content) return;
    if (content.skills.includes(s)) {
      toast.error("Skill already exists");
      return;
    }
    patchContent({ skills: [...content.skills, s] });
    setNewSkill("");
  }

  function removeSkill(index: number) {
    if (!content) return;
    patchContent({ skills: content.skills.filter((_, i) => i !== index) });
  }

  function addExperience() {
    if (!content) return;
    const item: ExperienceItem = {
      role: "New Role",
      company: "Company Name",
      period: "2024 — Present",
      description: "Describe your key impact and responsibilities.",
    };
    patchContent({ experience: [item, ...content.experience] });
  }

  function updateExp(index: number, patch: Partial<ExperienceItem>) {
    if (!content) return;
    const next = [...content.experience];
    next[index] = { ...next[index], ...patch };
    patchContent({ experience: next });
  }

  function removeExp(index: number) {
    if (!content) return;
    patchContent({ experience: content.experience.filter((_, i) => i !== index) });
  }

  function addEdu() {
    if (!content) return;
    const item: EducationItem = {
      degree: "B.S. in Computer Science",
      institution: "University Name",
      period: "2020 — 2024",
      description: "Honors, coursework, or achievements.",
    };
    patchContent({ education: [...(content.education || []), item] });
  }

  function updateEdu(index: number, patch: Partial<EducationItem>) {
    if (!content) return;
    const next = [...(content.education || [])];
    next[index] = { ...next[index], ...patch };
    patchContent({ education: next });
  }

  function removeEdu(index: number) {
    if (!content) return;
    patchContent({ education: (content.education || []).filter((_, i) => i !== index) });
  }

  function addProject() {
    if (!content) return;
    const item: ProjectItem = {
      title: "New Project",
      description: "Built something interesting with modern tools.",
      url: "",
      repo: "",
      tags: "TypeScript, React",
    };
    patchContent({ projects: [item, ...content.projects] });
  }

  function updateProj(index: number, patch: Partial<ProjectItem>) {
    if (!content) return;
    const next = [...content.projects];
    next[index] = { ...next[index], ...patch };
    patchContent({ projects: next });
  }

  function removeProj(index: number) {
    if (!content) return;
    patchContent({ projects: content.projects.filter((_, i) => i !== index) });
  }

  async function handlePhotoUpload(file: File | null) {
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      patchContent({ avatarUrl: url });
      toast.success("Avatar image updated");
    } catch {
      toast.error("Could not process image");
    }
  }

  async function handleDownloadHtml() {
    if (!content || !theme) return;
    try {
      const html = await renderPortfolioHtml({
        title,
        content,
        theme,
        sections: record.sections,
      });
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${record.slug || "portfolio"}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Portfolio HTML exported successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  }

  async function handleDeployLive() {
    const token = githubToken.trim() || session.token;
    if (!token) {
      toast.error("GitHub token required to publish");
      return;
    }
    if (!content || !theme) return;
    setBusy(true);
    try {
      const deployRepo = repoName.trim() || "my-portfolio";
      const result = await publishPortfolio({
        token,
        login: session.user.login === "guest" ? "user" : session.user.login,
        repo: deployRepo,
        portfolio: {
          ...record,
          title,
          content,
          theme,
        },
      });

      const updated = updatePortfolio(login, id, {
        github_repo: deployRepo,
        published: true,
        last_pushed_at: new Date().toISOString(),
        content,
        theme,
        title,
      });

      if (updated) {
        setRecord(updated);
        if (auth.currentUser) {
          const firestoreDoc: FirebasePortfolioDoc = {
            id: updated.id,
            userId: auth.currentUser.uid,
            slug: updated.slug,
            title: updated.title,
            published: true,
            github_repo: deployRepo,
            auto_push: !!updated.auto_push,
            last_pushed_at: updated.last_pushed_at || new Date().toISOString(),
            content: updated.content,
            theme: updated.theme,
            sections: updated.sections,
            createdAt: updated.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await savePortfolioToFirestore(auth.currentUser.uid, firestoreDoc);
          } catch (e) {
            console.error("Failed to sync deploy status to Firestore:", e);
          }
        }
      }

      toast.success(`Published to GitHub Pages! ${result.pagesUrl}`);
      setDeployOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deployment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Navbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="mr-1 size-4" /> Portfolios
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 max-w-[200px] font-semibold md:max-w-[280px]"
            placeholder="Portfolio Title"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewDevice((d) => (d === "desktop" ? "mobile" : "desktop"))}
            className="hidden sm:flex"
          >
            <Eye className="mr-1 size-4" />
            {previewDevice === "desktop" ? "Desktop" : "Mobile"}
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link to="/p/$slug" params={{ slug: record.slug }} target="_blank">
              <ExternalLink className="mr-1 size-4" /> Preview
            </Link>
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownloadHtml}>
            <Download className="mr-1 size-4" /> Export HTML
          </Button>

          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="mr-1 size-4" /> Save
          </Button>

          <Button variant="block" size="sm" onClick={() => setDeployOpen(true)}>
            <Globe className="mr-1 size-4" /> Deploy
          </Button>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Editor Controls */}
        <div className="w-full overflow-y-auto border-r p-6 md:w-[480px] lg:w-[540px]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="content">Profile</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={content.name}
                    onChange={(e) => patchContent({ name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Headline / Title</Label>
                  <Input
                    value={content.headline}
                    onChange={(e) => patchContent({ headline: e.target.value })}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Bio / Summary</Label>
                  <Textarea
                    value={content.bio}
                    onChange={(e) => patchContent({ bio: e.target.value })}
                    placeholder="A brief introduction about your focus and achievements..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Profile Picture</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {content.avatarUrl ? (
                      <img
                        src={content.avatarUrl}
                        alt="Avatar"
                        className="size-16 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="grid size-16 place-items-center rounded-full border bg-muted">
                        <User className="size-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={photoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e.target.files?.[0] ?? null)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <Upload className="mr-1 size-4" /> Upload Image
                      </Button>
                      <Input
                        value={content.avatarUrl}
                        onChange={(e) => patchContent({ avatarUrl: e.target.value })}
                        placeholder="Or paste an image URL..."
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Label className="mb-2 block font-semibold">Contact & Social Links</Label>
                  <div className="grid gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Email</span>
                      <Input
                        value={content.contact.email}
                        onChange={(e) => patchContact("email", e.target.value)}
                        placeholder="alex@example.com"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">GitHub Profile URL</span>
                      <Input
                        value={content.contact.github}
                        onChange={(e) => patchContact("github", e.target.value)}
                        placeholder="https://github.com/alex"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">LinkedIn URL</span>
                      <Input
                        value={content.contact.linkedin}
                        onChange={(e) => patchContact("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/alex"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Personal Website</span>
                      <Input
                        value={content.contact.website}
                        onChange={(e) => patchContact("website", e.target.value)}
                        placeholder="https://alex.dev"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block font-semibold">Skills & Tech Stack</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add skill (e.g. React, Docker)"
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {content.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full border bg-secondary px-3 py-1 text-xs font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              <div>
                <Label className="mb-3 block font-semibold">Choose Template Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATE_ORDER.map((tid) => {
                    const tmpl = TEMPLATES[tid];
                    const isSelected = theme.template === tid;
                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() => selectTemplate(tid)}
                        className={`rounded-xl border-2 p-3 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{tmpl.label}</span>
                          {isSelected && <Check className="size-4 text-primary" />}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{tmpl.blurb}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="block font-semibold">Custom Theme Tweaks</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Background Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.bg}
                        onChange={(e) => setTheme((t) => (t ? { ...t, bg: e.target.value } : null))}
                        className="size-8 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.bg}
                        onChange={(e) => setTheme((t) => (t ? { ...t, bg: e.target.value } : null))}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Text Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.fg}
                        onChange={(e) => setTheme((t) => (t ? { ...t, fg: e.target.value } : null))}
                        className="size-8 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.fg}
                        onChange={(e) => setTheme((t) => (t ? { ...t, fg: e.target.value } : null))}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Accent Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.accent}
                        onChange={(e) =>
                          setTheme((t) => (t ? { ...t, accent: e.target.value } : null))
                        }
                        className="size-8 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.accent}
                        onChange={(e) =>
                          setTheme((t) => (t ? { ...t, accent: e.target.value } : null))
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Surface / Card Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.surface}
                        onChange={(e) =>
                          setTheme((t) => (t ? { ...t, surface: e.target.value } : null))
                        }
                        className="size-8 cursor-pointer rounded border"
                      />
                      <Input
                        value={theme.surface}
                        onChange={(e) =>
                          setTheme((t) => (t ? { ...t, surface: e.target.value } : null))
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Work Experience</Label>
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="mr-1 size-4" /> Add Role
                </Button>
              </div>

              {content.experience.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No experience entries yet. Click "Add Role" to get started.
                </div>
              ) : (
                content.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Role #{idx + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => removeExp(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={exp.role}
                        onChange={(e) => updateExp(idx, { role: e.target.value })}
                        placeholder="Role / Title"
                      />
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExp(idx, { company: e.target.value })}
                        placeholder="Company"
                      />
                    </div>
                    <Input
                      value={exp.period}
                      onChange={(e) => updateExp(idx, { period: e.target.value })}
                      placeholder="e.g. 2022 — Present"
                    />
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExp(idx, { description: e.target.value })}
                      placeholder="Summary of responsibilities and achievements..."
                      className="min-h-[70px] text-sm"
                    />
                  </div>
                ))
              )}
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Education & Degrees</Label>
                <Button variant="outline" size="sm" onClick={addEdu}>
                  <Plus className="mr-1 size-4" /> Add Education
                </Button>
              </div>

              {!content.education || content.education.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No education entries yet. Click "Add Education" to add your degree or diploma.
                </div>
              ) : (
                content.education.map((edu, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Degree #{idx + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => removeEdu(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEdu(idx, { degree: e.target.value })}
                        placeholder="Degree / Program"
                      />
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEdu(idx, { institution: e.target.value })}
                        placeholder="Institution / School"
                      />
                    </div>
                    <Input
                      value={edu.period}
                      onChange={(e) => updateEdu(idx, { period: e.target.value })}
                      placeholder="e.g. 2020 — 2024"
                    />
                    <Input
                      value={edu.description || ""}
                      onChange={(e) => updateEdu(idx, { description: e.target.value })}
                      placeholder="Honors, relevant coursework, or thesis..."
                      className="text-sm"
                    />
                  </div>
                ))
              )}
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Featured Projects</Label>
                <Button variant="outline" size="sm" onClick={addProject}>
                  <Plus className="mr-1 size-4" /> Add Project
                </Button>
              </div>

              {content.projects.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No projects added yet. Click "Add Project" to add your showcase work.
                </div>
              ) : (
                content.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Project #{idx + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => removeProj(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <Input
                      value={proj.title}
                      onChange={(e) => updateProj(idx, { title: e.target.value })}
                      placeholder="Project Title"
                    />
                    <Textarea
                      value={proj.description}
                      onChange={(e) => updateProj(idx, { description: e.target.value })}
                      placeholder="What does it do? Key technologies and outcome..."
                      className="min-h-[70px] text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={proj.url || ""}
                        onChange={(e) => updateProj(idx, { url: e.target.value })}
                        placeholder="Live Demo URL (optional)"
                      />
                      <Input
                        value={proj.repo || ""}
                        onChange={(e) => updateProj(idx, { repo: e.target.value })}
                        placeholder="GitHub Repo URL (optional)"
                      />
                    </div>
                    <Input
                      value={
                        typeof proj.tags === "string"
                          ? proj.tags
                          : Array.isArray(proj.tags)
                            ? (proj.tags as string[]).join(", ")
                            : ""
                      }
                      onChange={(e) =>
                        updateProj(idx, {
                          tags: e.target.value,
                        })
                      }
                      placeholder="Tags comma-separated (e.g. Next.js, Stripe, Tailwind)"
                      className="text-xs"
                    />
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Live Preview Canvas */}
        <div className="hidden flex-1 items-center justify-center overflow-y-auto bg-muted/30 p-6 md:flex">
          <div
            className={`transition-all duration-300 ${
              previewDevice === "mobile"
                ? "h-[740px] w-[375px] overflow-y-auto rounded-[36px] border-[10px] border-ink bg-background shadow-2xl"
                : "h-full w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-background shadow-md"
            }`}
          >
            <PortfolioView
              content={content}
              theme={theme}
              sections={record.sections}
              repos={repos.data ?? null}
              liquidBackground={true}
            />
          </div>
        </div>
      </div>

      {/* Deploy Dialog */}
      {deployOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Deploy to GitHub Pages</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish your portfolio as a free static website hosted on GitHub Pages.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <Label>Repository Name</Label>
                <Input
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-"))}
                  placeholder="my-portfolio"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>GitHub Personal Access Token (repo scope)</Label>
                <Input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder={session.token ? "Using signed-in session token" : "ghp_..."}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Get a classic token with <strong>repo</strong> permissions at{" "}
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Folio"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-primary"
                  >
                    github.com/settings/tokens
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeployOpen(false)}>
                Cancel
              </Button>
              <Button variant="block" onClick={handleDeployLive} disabled={busy}>
                {busy ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                Publish Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
