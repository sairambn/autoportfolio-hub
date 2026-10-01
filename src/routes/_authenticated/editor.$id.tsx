import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
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
import {
  completeGithubConnect,
  disconnectGithub,
  githubStatus,
  publishToGithub,
  startGithubConnect,
} from "@/lib/github.functions";

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
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const portfolio = useQuery({
    queryKey: ["portfolio", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const gh = useQuery({
    queryKey: ["github-status"],
    queryFn: () => githubStatus(),
  });

  if (portfolio.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (portfolio.error || !portfolio.data) {
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

  return (
    <Editor
      key={portfolio.data.id}
      row={portfolio.data}
      github={gh.data ?? { configured: false, connected: false, login: null }}
      onGithubChange={() => qc.invalidateQueries({ queryKey: ["github-status"] })}
    />
  );
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
  github,
  onGithubChange,
}: {
  row: Row;
  github: { configured: boolean; connected: boolean; login: string | null };
  onGithubChange: () => void;
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
      const { error } = await supabase
        .from("portfolios")
        .update({
          title,
          slug,
          published,
          auto_push: autoPush,
          content: content as never,
          theme: theme as never,
          sections: sections as never,
        })
        .eq("id", row.id);
      setSaving(false);
      if (error) {
        toast.error(error.message);
        return false;
      }
      setDirty(false);
      if (!opts?.silent) toast.success("Saved");
      return true;
    },
    [title, slug, published, autoPush, content, theme, sections, row.id],
  );

  const autoPushRef = useRef(autoPush);
  useEffect(() => { autoPushRef.current = autoPush; }, [autoPush]);

  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await persist({ silent: true });
      if (ok && autoPushRef.current && repoName.trim()) {
        try {
          await publishToGithub({ data: { portfolioId: row.id, repo: repoName.trim() } });
        } catch {
          // auto-push failures are silent — user can see last-push status via manual publish
        }
      }
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [dirty, persist, repoName, row.id]);

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

  function toggleSection(id: string) {
    setSections((ss) => ss.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
    markDirty();
  }

  function addSection(type: SectionType) {
    setSections((ss) => [...ss, { id: uid(), type, visible: true }]);
    markDirty();
  }

  function removeSection(id: string) {
    setSections((ss) => ss.filter((s) => s.id !== id));
    markDirty();
  }

  async function connectGithub() {
    try {
      const res = await startGithubConnect();
      const authUrl =
        res && typeof res === "object" && "authorizationUrl" in res
          ? (res as { authorizationUrl: string }).authorizationUrl
          : null;
      if (!authUrl) {
        toast.error("Could not start GitHub connect");
        return;
      }

      const popup = window.open(authUrl, "github-oauth", "width=600,height=700");
      if (!popup) {
        toast.error("Allow popups to connect GitHub");
        return;
      }

      const onMessage = async (ev: MessageEvent) => {
        if (ev.origin !== window.location.origin) return;
        const data = ev.data as { type?: string; code?: string | null; connectorId?: string };
        if (!data?.type?.startsWith("appUserConnectorOAuth")) return;
        window.removeEventListener("message", onMessage);

        if (data.type === "appUserConnectorOAuthFailed") {
          toast.error("GitHub connection failed");
          return;
        }
        if (data.code) {
          try {
            await completeGithubConnect({ data: { code: data.code } });
            onGithubChange();
            toast.success("GitHub connected");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not finish connect");
          }
        } else {
          onGithubChange();
          toast.success("GitHub connected");
        }
      };
      window.addEventListener("message", onMessage);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "GitHub connect failed");
    }
  }

  async function doDisconnect() {
    try {
      await disconnectGithub();
      onGithubChange();
      toast.success("GitHub disconnected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    }
  }

  async function doPublish() {
    setPublishing(true);
    await persist({ silent: true });
    try {
      const result = await publishToGithub({
        data: { portfolioId: row.id, repo: repoName.trim() },
      });
      toast.success(
        <span>
          Published!{" "}
          <a className="underline" href={result.pagesUrl} target="_blank" rel="noreferrer">
            Open site
          </a>
        </span>,
      );
      onGithubChange();
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
            <Link to="/p/$slug" params={{ slug: row.slug }} target="_blank">
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
              <ThemePanel
                theme={theme}
                setTemplate={setTemplate}
                setPalette={setPalette}
                setFont={setFont}
              />
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
                github={github}
                slug={slug}
                setSlug={(s) => { setSlug(s); markDirty(); }}
                published={published}
                setPublished={(v) => { setPublished(v); markDirty(); }}
                autoPush={autoPush}
                setAutoPush={(v) => { setAutoPush(v); markDirty(); }}
                repoName={repoName}
                setRepoName={setRepoName}
                onConnect={connectGithub}
                onDisconnect={doDisconnect}
                onPublish={doPublish}
                publishing={publishing}
              />
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40">
          <div className="mx-auto min-h-full max-w-4xl shadow-lg">
            <PortfolioView
              content={content}
              theme={theme}
              sections={sections}
              repos={repos.data ?? null}
            />
          </div>
        </main>
      </div>
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
    const projects = content.projects.map((p, idx) =>
      idx === i ? { ...p, [field]: value } : p,
    );
    setContent({ ...content, projects });
  }

  function updateExp(i: number, field: keyof Experience, value: string) {
    const experience = content.experience.map((e, idx) =>
      idx === i ? { ...e, [field]: value } : e,
    );
    setContent({ ...content, experience });
  }

  return (
    <div className="space-y-6">
      <Field label="Name">
        <Input value={content.name} onChange={(e) => patchContent({ name: e.target.value })} />
      </Field>
      <Field label="Headline">
        <Input
          value={content.headline}
          onChange={(e) => patchContent({ headline: e.target.value })}
        />
      </Field>
      <Field label="Location">
        <Input
          value={content.location}
          onChange={(e) => patchContent({ location: e.target.value })}
          placeholder="City, Country"
        />
      </Field>
      <Field label="Avatar URL">
        <Input
          value={content.avatarUrl}
          onChange={(e) => patchContent({ avatarUrl: e.target.value })}
          placeholder="https://…"
        />
      </Field>
      <Field label="Bio">
        <Textarea
          rows={4}
          value={content.bio}
          onChange={(e) => patchContent({ bio: e.target.value })}
        />
      </Field>
      <Field label="Skills (comma separated)">
        <Input
          value={content.skills.join(", ")}
          onChange={(e) =>
            patchContent({
              skills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
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
                projects: [
                  ...content.projects,
                  { title: "New project", description: "", url: "", tags: "" },
                ],
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
                <Input
                  placeholder="Title"
                  value={p.title}
                  onChange={(e) => updateProject(i, "title", e.target.value)}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setContent({
                      ...content,
                      projects: content.projects.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="Description"
                value={p.description}
                onChange={(e) => updateProject(i, "description", e.target.value)}
              />
              <Input
                placeholder="URL"
                value={p.url}
                onChange={(e) => updateProject(i, "url", e.target.value)}
              />
              <Input
                placeholder="Tags"
                value={p.tags}
                onChange={(e) => updateProject(i, "tags", e.target.value)}
              />
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
                experience: [
                  ...content.experience,
                  { role: "Role", company: "", period: "", description: "" },
                ],
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
                <Input
                  placeholder="Role"
                  value={e.role}
                  onChange={(ev) => updateExp(i, "role", ev.target.value)}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setContent({
                      ...content,
                      experience: content.experience.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Input
                placeholder="Company"
                value={e.company}
                onChange={(ev) => updateExp(i, "company", ev.target.value)}
              />
              <Input
                placeholder="Period"
                value={e.period}
                onChange={(ev) => updateExp(i, "period", ev.target.value)}
              />
              <Textarea
                rows={2}
                placeholder="Description"
                value={e.description}
                onChange={(ev) => updateExp(i, "description", ev.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Contact links</Label>
        {(["email", "website", "github", "linkedin", "twitter"] as const).map((k) => (
          <Input
            key={k}
            placeholder={k}
            value={content.contact[k]}
            onChange={(e) => patchContact(k, e.target.value)}
          />
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
              className={`rounded-md border-2 px-3 py-3 text-left text-sm font-semibold capitalize transition-all ${
                theme.template === id
                  ? "border-primary bg-primary/10 shadow-block-sm"
                  : "border-ink/20 hover:border-ink/40"
              }`}
            >
              {TEMPLATES[id].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Colors</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["bg", "fg", "accent", "muted", "surface"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input
                type="color"
                value={theme.palette[k]}
                onChange={(e) => setPalette(k, e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border-2 border-ink"
              />
              <span className="capitalize">{k}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Font pair</Label>
        <div className="space-y-2">
          {(Object.keys(FONTS) as FontId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFont(id)}
              className={`block w-full rounded-md border-2 px-3 py-2 text-left text-sm ${
                theme.font === id
                  ? "border-primary bg-primary/10"
                  : "border-ink/20 hover:border-ink/40"
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
  const missing = ALL_SECTIONS.filter((t) => !sections.some((s) => s.type === t));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Drag to reorder. Hide sections you do not need.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {sections.map((s) => (
              <SortableRow
                key={s.id}
                section={s}
                onToggle={() => toggleSection(s.id)}
                onRemove={() => removeSection(s.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {missing.length > 0 && (
        <div className="pt-2">
          <Label className="mb-2 block">Add section</Label>
          <div className="flex flex-wrap gap-2">
            {missing.map((t) => (
              <Button key={t} type="button" size="sm" variant="outline" onClick={() => addSection(t)}>
                <Plus /> {SECTION_LABELS[t]}
              </Button>
            ))}
          </div>
        </div>
      )}
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border-2 border-ink/20 bg-background px-2 py-2"
    >
      <button type="button" className="cursor-grab touch-none p-1" {...attributes} {...listeners}>
        <GripVertical className="size-4 text-muted-foreground" />
      </button>
      <span className="flex-1 text-sm font-medium">{SECTION_LABELS[section.type]}</span>
      <button type="button" onClick={onToggle} className="p-1" title={section.visible ? "Hide" : "Show"}>
        {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
      </button>
      <button type="button" onClick={onRemove} className="p-1 text-destructive">
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

function GithubPanel({
  content,
  patchContent,
  github,
  slug,
  setSlug,
  published,
  setPublished,
  autoPush,
  setAutoPush,
  repoName,
  setRepoName,
  onConnect,
  onDisconnect,
  onPublish,
  publishing,
}: {
  content: Content;
  patchContent: (p: Partial<Content>) => void;
  github: { configured: boolean; connected: boolean; login: string | null };
  slug: string;
  setSlug: (s: string) => void;
  published: boolean;
  setPublished: (v: boolean) => void;
  autoPush: boolean;
  setAutoPush: (v: boolean) => void;
  repoName: string;
  setRepoName: (s: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  return (
    <div className="space-y-6">
      <Field label="Portfolio URL slug">
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-"))}
          placeholder="my-portfolio"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Public URL will be <code>/p/{slug || "your-slug"}</code>
        </p>
      </Field>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-sm font-medium">Published (visible at public URL)</span>
      </label>

      <div>
        <Label className="mb-1 block">Public GitHub username</Label>
        <p className="mb-2 text-xs text-muted-foreground">
          Used to pull public repos into the GitHub section (no login needed).
        </p>
        <Input
          value={content.githubUsername}
          onChange={(e) => patchContent({ githubUsername: e.target.value.trim() })}
          placeholder="your-handle"
        />
      </div>

      <div className="space-y-3 rounded-md border-2 border-ink/20 p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Github className="size-5" /> Publish to your GitHub
        </div>
        {!github.configured ? (
          <p className="text-sm text-muted-foreground">
            GitHub publishing is not configured on this deployment yet. You can still show public
            repos by username above.
          </p>
        ) : !github.connected ? (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to push a static site to a repo and enable GitHub Pages.
            </p>
            <Button variant="block" onClick={onConnect}>
              <Github /> Connect GitHub
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm">
              Connected as <strong>@{github.login}</strong>
            </p>
            <Field label="Repository name">
              <Input
                value={repoName}
                onChange={(e) => setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-"))}
                placeholder="my-portfolio"
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={autoPush}
                onChange={(e) => setAutoPush(e.target.checked)}
              />
              <span className="text-sm">Auto-push to GitHub on every save</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="block" onClick={onPublish} disabled={publishing || !repoName.trim()}>
                {publishing ? <Loader2 className="animate-spin" /> : <Upload />}
                Publish
              </Button>
              <Button variant="ghost" size="sm" onClick={onDisconnect}>
                Disconnect
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Creates the repo if needed, writes index.html, and tries to turn on GitHub Pages.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
