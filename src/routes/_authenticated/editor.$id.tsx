import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Github,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PortfolioView } from "@/components/PortfolioView";
import { useGithubRepos } from "@/hooks/use-github-repos";
import {
  ALL_SECTIONS,
  FONTS,
  SECTION_LABELS,
  TEMPLATES,
  normalize,
  uid,
  type Content,
  type Experience,
  type FontId,
  type Project,
  type Section,
  type SectionType,
  type TemplateId,
  type Theme,
} from "@/lib/portfolio";
import { getPortfolio, updatePortfolio } from "@/lib/storage";
import { publishPortfolio } from "@/lib/github-client";

export const Route = createFileRoute("/_authenticated/editor/$id")({
  head: () => ({
    meta: [
      { title: "Edit portfolio — Folio" },
      { name: "description", content: "Design your portfolio and publish to GitHub." },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  const { id } = Route.useParams();
  const { session } = Route.useRouteContext();
  const login = session.user.login;
  const row = getPortfolio(login, id);

  if (!row) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="text-3xl font-black">Portfolio not found</h1>
          <Button asChild variant="block" className="mt-4">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Editor key={row.id} row={row} token={session.token} login={login} />;
}

type Row = {
  id: string;
  slug: string;
  title: string;
  content: unknown;
  theme: unknown;
  sections: unknown;
  github_repo: string | null;
  auto_push: boolean;
  published: boolean;
};

function Editor({
  row,
  token,
  login,
}: {
  row: Row;
  token: string;
  login: string;
}) {
  const initial = normalize(row);
  const [title, setTitle] = useState(row.title);
  const [slug, setSlug] = useState(row.slug);
  const [published, setPublished] = useState(row.published);
  const [autoPush, setAutoPush] = useState(row.auto_push);
  const [content, setContent] = useState<Content>(initial.content);
  const [theme, setTheme] = useState<Theme>(initial.theme);
  const [sections, setSections] = useState<Section[]>(initial.sections);
  const [tab, setTab] = useState<"content" | "theme" | "sections" | "github">("content");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [repoName, setRepoName] = useState(row.github_repo ?? "my-portfolio");
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repos = useGithubRepos(content.githubUsername);
  const markDirty = useCallback(() => setDirty(true), []);

  const persist = useCallback(
    async (opts?: { silent?: boolean }) => {
      setSaving(true);
      const updated = updatePortfolio(login, row.id, {
        title,
        slug,
        published,
        auto_push: autoPush,
        content,
        theme,
        sections,
      });
      setSaving(false);
      if (!updated) {
        toast.error("Could not save");
        return false;
      }
      setDirty(false);
      if (!opts?.silent) toast.success("Saved");
      return true;
    },
    [title, slug, published, autoPush, content, theme, sections, row.id, login],
  );

  const autoPushRef = useRef(autoPush);
  useEffect(() => {
    autoPushRef.current = autoPush;
  }, [autoPush]);

  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await persist({ silent: true });
      if (ok && autoPushRef.current && repoName.trim()) {
        try {
          const latest = getPortfolio(login, row.id);
          if (latest) {
            await publishPortfolio({ token, login, repo: repoName.trim(), portfolio: latest });
            updatePortfolio(login, row.id, {
              github_repo: repoName.trim(),
              last_pushed_at: new Date().toISOString(),
              published: true,
            });
          }
        } catch {
          /* silent */
        }
      }
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [dirty, persist, repoName, row.id, login, token]);

  function patchContent(partial: Partial<Content>) {
    setContent((c) => ({ ...c, ...partial }));
    markDirty();
  }
  function patchContact(key: keyof Content["contact"], value: string) {
    setContent((c) => ({ ...c, contact: { ...c.contact, [key]: value } }));
    markDirty();
  }
  function setTemplate(id: TemplateId) {
    setTheme(structuredClone(TEMPLATES[id].theme));
    markDirty();
  }
  function setPalette(key: keyof Theme["palette"], value: string) {
    setTheme((t) => ({ ...t, palette: { ...t.palette, [key]: value } }));
    markDirty();
  }
  function setFont(font: FontId) {
    setTheme((t) => ({ ...t, font }));
    markDirty();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((items) => {
      const oldIndex = items.findIndex((s) => s.id === active.id);
      const newIndex = items.findIndex((s) => s.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
    markDirty();
  }
  function toggleSection(sid: string) {
    setSections((ss) => ss.map((s) => (s.id === sid ? { ...s, visible: !s.visible } : s)));
    markDirty();
  }
  function addSection(type: SectionType) {
    setSections((ss) => [...ss, { id: uid(), type, visible: true }]);
    markDirty();
  }
  function removeSection(sid: string) {
    setSections((ss) => ss.filter((s) => s.id !== sid));
    markDirty();
  }

  async function doPublish() {
    setPublishing(true);
    await persist({ silent: true });
    try {
      const latest = getPortfolio(login, row.id);
      if (!latest) throw new Error("Portfolio missing");
      const result = await publishPortfolio({
        token,
        login,
        repo: repoName.trim(),
        portfolio: { ...latest, content, theme, sections, title, slug },
      });
      updatePortfolio(login, row.id, {
        github_repo: repoName.trim(),
        last_pushed_at: new Date().toISOString(),
        published: true,
      });
      setPublished(true);
      toast.success(
        <span>
          Published!{" "}
          <a className="underline" href={result.pagesUrl} target="_blank" rel="noreferrer">
            Open site
          </a>
        </span>,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    }
    setPublishing(false);
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b-2 border-ink px-4 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft /> Dashboard
          </Link>
        </Button>
        <Input
          className="max-w-[200px] border-0 bg-transparent text-lg font-bold shadow-none focus-visible:ring-0"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
        />
        <span className="text-xs text-muted-foreground">
          {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="blockOutline" size="sm">
            <Link to="/p/$slug" params={{ slug }} target="_blank">
              <ExternalLink /> Preview
            </Link>
          </Button>
          <Button variant="block" size="sm" onClick={() => persist()} disabled={saving}>
            <Save /> Save
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-full max-w-md shrink-0 flex-col border-r-2 border-ink bg-card">
          <div className="flex border-b-2 border-ink">
            {(["content", "theme", "sections", "github"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {tab === "content" && (
              <ContentPanel
                content={content}
                patchContent={patchContent}
                patchContact={patchContact}
                setContent={(c) => {
                  setContent(c);
                  markDirty();
                }}
              />
            )}
            {tab === "theme" && (
              <ThemePanel theme={theme} setTemplate={setTemplate} setPalette={setPalette} setFont={setFont} />
            )}
            {tab === "sections" && (
              <SectionsPanel
                sections={sections}
                sensors={sensors}
                onDragEnd={onDragEnd}
                toggleSection={toggleSection}
                removeSection={removeSection}
                addSection={addSection}
              />
            )}
            {tab === "github" && (
              <GithubPanel
                content={content}
                patchContent={patchContent}
                login={login}
                slug={slug}
                setSlug={(s) => {
                  setSlug(s);
                  markDirty();
                }}
                autoPush={autoPush}
                setAutoPush={(v) => {
                  setAutoPush(v);
                  markDirty();
                }}
                repoName={repoName}
                setRepoName={setRepoName}
                onPublish={doPublish}
                publishing={publishing}
              />
            )}
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40">
          <div className="mx-auto min-h-full max-w-4xl shadow-lg">
            <PortfolioView content={content} theme={theme} sections={sections} repos={repos.data ?? null} />
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function ContentPanel({
  content,
  patchContent,
  patchContact,
  setContent,
}: {
  content: Content;
  patchContent: (p: Partial<Content>) => void;
  patchContact: (k: keyof Content["contact"], v: string) => void;
  setContent: (c: Content) => void;
}) {
  function updateProject(i: number, field: keyof Project, value: string) {
    const projects = content.projects.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
    setContent({ ...content, projects });
  }
  function updateExp(i: number, field: keyof Experience, value: string) {
    const experience = content.experience.map((e, idx) => (idx === i ? { ...e, [field]: value } : e));
    setContent({ ...content, experience });
  }
  return (
    <div className="space-y-6">
      <Field label="Name">
        <Input value={content.name} onChange={(e) => patchContent({ name: e.target.value })} />
      </Field>
      <Field label="Headline">
        <Input value={content.headline} onChange={(e) => patchContent({ headline: e.target.value })} />
      </Field>
      <Field label="Location">
        <Input value={content.location} onChange={(e) => patchContent({ location: e.target.value })} placeholder="City, Country" />
      </Field>
      <Field label="Avatar URL">
        <Input value={content.avatarUrl} onChange={(e) => patchContent({ avatarUrl: e.target.value })} placeholder="https://…" />
      </Field>
      <Field label="Bio">
        <Textarea rows={4} value={content.bio} onChange={(e) => patchContent({ bio: e.target.value })} />
      </Field>
      <Field label="Skills (comma separated)">
        <Input
          value={content.skills.join(", ")}
          onChange={(e) =>
            patchContent({
              skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </Field>
      <Field label="GitHub username (for repos section)">
        <Input
          value={content.githubUsername}
          onChange={(e) => patchContent({ githubUsername: e.target.value.trim() })}
          placeholder="your-handle"
        />
      </Field>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Projects</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setContent({
                ...content,
                projects: [...content.projects, { title: "New project", description: "", url: "", tags: "" }],
              })
            }
          >
            <Plus /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {content.projects.map((p, i) => (
            <div key={i} className="space-y-2 rounded-md border-2 border-ink/20 p-3">
              <div className="flex gap-2">
                <Input placeholder="Title" value={p.title} onChange={(e) => updateProject(i, "title", e.target.value)} />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setContent({ ...content, projects: content.projects.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea rows={2} placeholder="Description" value={p.description} onChange={(e) => updateProject(i, "description", e.target.value)} />
              <Input placeholder="URL" value={p.url} onChange={(e) => updateProject(i, "url", e.target.value)} />
              <Input placeholder="Tags" value={p.tags} onChange={(e) => updateProject(i, "tags", e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Experience</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setContent({
                ...content,
                experience: [...content.experience, { role: "Role", company: "Company", period: "", description: "" }],
              })
            }
          >
            <Plus /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {content.experience.map((e, i) => (
            <div key={i} className="space-y-2 rounded-md border-2 border-ink/20 p-3">
              <div className="flex gap-2">
                <Input placeholder="Role" value={e.role} onChange={(ev) => updateExp(i, "role", ev.target.value)} />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setContent({ ...content, experience: content.experience.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Input placeholder="Company" value={e.company} onChange={(ev) => updateExp(i, "company", ev.target.value)} />
              <Input placeholder="Period" value={e.period} onChange={(ev) => updateExp(i, "period", ev.target.value)} />
              <Textarea rows={2} placeholder="Description" value={e.description} onChange={(ev) => updateExp(i, "description", ev.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Contact</Label>
        {(["email", "website", "github", "linkedin", "twitter"] as const).map((k) => (
          <Input key={k} placeholder={k} value={content.contact[k]} onChange={(e) => patchContact(k, e.target.value)} />
        ))}
      </div>
    </div>
  );
}

function ThemePanel({
  theme,
  setTemplate,
  setPalette,
  setFont,
}: {
  theme: Theme;
  setTemplate: (id: TemplateId) => void;
  setPalette: (k: keyof Theme["palette"], v: string) => void;
  setFont: (f: FontId) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Template</Label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TEMPLATES) as TemplateId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTemplate(id)}
              className={`rounded-md border-2 px-3 py-2 text-left text-sm font-semibold capitalize ${
                theme.template === id ? "border-primary bg-primary/10" : "border-ink/20"
              }`}
            >
              {TEMPLATES[id].label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Colors</Label>
        <div className="space-y-2">
          {(Object.keys(theme.palette) as (keyof Theme["palette"])[]).map((k) => (
            <div key={k} className="flex items-center gap-2">
              <input type="color" value={theme.palette[k]} onChange={(e) => setPalette(k, e.target.value)} className="h-9 w-12 cursor-pointer" />
              <span className="w-20 text-xs capitalize">{k}</span>
              <Input value={theme.palette[k]} onChange={(e) => setPalette(k, e.target.value)} className="font-mono text-xs" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Font</Label>
        <div className="space-y-1">
          {(Object.keys(FONTS) as FontId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFont(id)}
              className={`block w-full rounded-md border-2 px-3 py-2 text-left text-sm ${
                theme.font === id ? "border-primary bg-primary/10" : "border-ink/20"
              }`}
            >
              {FONTS[id].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionsPanel({
  sections,
  sensors,
  onDragEnd,
  toggleSection,
  removeSection,
  addSection,
}: {
  sections: Section[];
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (e: DragEndEvent) => void;
  toggleSection: (id: string) => void;
  removeSection: (id: string) => void;
  addSection: (t: SectionType) => void;
}) {
  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((s) => (
              <SortableRow key={s.id} section={s} onToggle={() => toggleSection(s.id)} onRemove={() => removeSection(s.id)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-wrap gap-2">
        {ALL_SECTIONS.map((t) => (
          <Button key={t} type="button" size="sm" variant="outline" onClick={() => addSection(t)}>
            <Plus className="size-3" /> {SECTION_LABELS[t]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function SortableRow({
  section,
  onToggle,
  onRemove,
}: {
  section: Section;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-md border-2 border-ink/20 bg-background px-2 py-2">
      <button type="button" className="cursor-grab touch-none p-1" {...attributes} {...listeners}>
        <GripVertical className="size-4 text-muted-foreground" />
      </button>
      <span className="flex-1 text-sm font-medium">{SECTION_LABELS[section.type]}</span>
      <button type="button" onClick={onToggle} className="p-1">
        {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
      </button>
      <button type="button" onClick={onRemove} className="p-1">
        <Trash2 className="size-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function GithubPanel({
  content,
  patchContent,
  login,
  slug,
  setSlug,
  autoPush,
  setAutoPush,
  repoName,
  setRepoName,
  onPublish,
  publishing,
}: {
  content: Content;
  patchContent: (p: Partial<Content>) => void;
  login: string;
  slug: string;
  setSlug: (s: string) => void;
  autoPush: boolean;
  setAutoPush: (v: boolean) => void;
  repoName: string;
  setRepoName: (s: string) => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  return (
    <div className="space-y-6">
      <Field label="Portfolio slug">
        <Input
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-"))
          }
          placeholder="my-portfolio"
        />
      </Field>
      <div>
        <Label className="mb-1 block">Public GitHub username</Label>
        <p className="mb-2 text-xs text-muted-foreground">Used to pull public repos into the GitHub section.</p>
        <Input
          value={content.githubUsername}
          onChange={(e) => patchContent({ githubUsername: e.target.value.trim() })}
          placeholder={login}
        />
      </div>
      <div className="space-y-3 rounded-md border-2 border-ink/20 p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Github className="size-5" /> Publish to GitHub Pages
        </div>
        <p className="text-sm text-muted-foreground">
          Signed in as <strong>@{login}</strong>. Folio creates or updates a public repo and pushes index.html.
        </p>
        <Field label="Repository name">
          <Input
            value={repoName}
            onChange={(e) => setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-"))}
            placeholder="my-portfolio"
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="h-4 w-4" checked={autoPush} onChange={(e) => setAutoPush(e.target.checked)} />
          <span className="text-sm font-medium">Auto-push on save</span>
        </label>
        <Button variant="block" className="w-full" onClick={onPublish} disabled={publishing || !repoName.trim()}>
          {publishing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Publishing…
            </>
          ) : (
            <>
              <Upload /> Publish now
            </>
          )}
        </Button>
        {repoName.trim() ? (
          <p className="text-xs text-muted-foreground">
            Live site:{" "}
            <a className="underline" href={`https://${login}.github.io/${repoName.trim()}/`} target="_blank" rel="noreferrer">
              {login}.github.io/{repoName.trim()}/
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
