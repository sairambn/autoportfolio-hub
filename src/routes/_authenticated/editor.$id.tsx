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
  Download,
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
import { downloadPortfolioHtml } from "@/lib/download";

export const Route = createFileRoute("/_authenticated/editor/$id")({
  head: () => ({
    meta: [
      { title: "Edit portfolio — Folio" },
      { name: "description", content: "Design your portfolio and download or publish it." },
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
  const [downloading, setDownloading] = useState(false);
  const guest = login === "guest" || !token;
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
      if (ok && autoPushRef.current && repoName.trim() && token) {
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

  async function doDownload() {
    setDownloading(true);
    try {
      await persist({ silent: true });
      await downloadPortfolioHtml({
        title,
        content,
        theme,
        sections,
        filename: title || "portfolio",
      });
      toast.success("Downloaded HTML file");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
    setDownloading(false);
  }

  async function doPublish() {
    if (guest) {
      toast.error("Sign in with GitHub to publish, or use Download HTML");
      return;
    }
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
          <Button variant="block" size="sm" onClick={doDownload} disabled={downloading}>
            {downloading ? <Loader2 className="animate-spin" /> : <Download />}
            Download
          </Button>
          <Button asChild variant="blockOutline" size="sm">
            <Link to="/p/$slug" params={{ slug }} target="_blank">
              <ExternalLink /> Preview
            </Link>
          </Button>
          <Button variant="blockOutline" size="sm" onClick={() => persist()} disabled={saving}>
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
                {t === "github" ? "export" : t}
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
                guest={guest}
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
                onDownload={doDownload}
                publishing={publishing}
                downloading={downloading}
              />
            )}
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40">
          <div className="mx-auto min-h-full max-w-4xl shadow-lg">
            <PortfolioView content={content} theme={theme} sections={sections} repos={repos.data ?? null} liquidBackground={true} />
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

// NOTE: The rest of the file (ContentPanel, ThemePanel, SectionsPanel, GithubPanel, SortableRow)
// remains unchanged from the original. This update only enables liquidBackground={true} on the live preview.
