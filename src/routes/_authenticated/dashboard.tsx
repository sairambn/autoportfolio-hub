import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/auth";
import { downloadPortfolioHtml } from "@/lib/download";
import {
  createPortfolio,
  deletePortfolio,
  listPortfolios,
  type PortfolioRecord,
} from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your portfolios — Folio" },
      { name: "description", content: "Manage your portfolios." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { session } = Route.useRouteContext();
  const nav = useNavigate();
  const login = session.user.login;
  const guest = login === "guest" || !session.token;
  const [list, setList] = useState<PortfolioRecord[]>(() => listPortfolios(login));
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setList(listPortfolios(login));
  }, [login]);

  function refresh() {
    setList(listPortfolios(login));
  }

  function create() {
    const p = createPortfolio(login);
    nav({ to: "/editor/$id", params: { id: p.id } });
  }

  function remove(id: string) {
    if (!confirm("Delete this portfolio from this browser? This cannot be undone.")) return;
    deletePortfolio(login, id);
    refresh();
    toast.success("Portfolio deleted");
  }

  async function doDownload(p: PortfolioRecord) {
    setDownloading(p.id);
    try {
      await downloadPortfolioHtml({
        title: p.title,
        content: p.content,
        theme: p.theme,
        sections: p.sections,
        filename: p.title || "portfolio",
      });
      toast.success("Downloaded HTML ✓");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
    setDownloading(null);
  }

  function signOut() {
    clearSession();
    nav({ to: "/" });
  }

  const publishedCount = list.filter((p) => p.github_repo).length;
  const draftCount = list.filter((p) => !p.github_repo).length;

  return (
    <div className="min-h-screen grain">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">
          Folio.
        </Link>
        <div className="flex items-center gap-3">
          {session.user.avatar_url ? (
            <img
              src={session.user.avatar_url}
              alt=""
              className="size-8 rounded-full border-2 border-ink"
            />
          ) : (
            <div className="grid size-8 place-items-center rounded-full border-2 border-ink bg-muted">
              <User className="size-4" />
            </div>
          )}
          <span className="text-sm font-medium hidden sm:block">
            {guest ? "Guest" : `@${login}`}
          </span>
          {guest ? (
            <Button asChild variant="blockOutline" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <LayoutDashboard className="size-3.5" /> Dashboard
            </div>
            <h1 className="text-5xl font-black">Your portfolios</h1>
            {list.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {publishedCount > 0 && `${publishedCount} published`}
                {publishedCount > 0 && draftCount > 0 && " · "}
                {draftCount > 0 && `${draftCount} draft${draftCount > 1 ? "s" : ""}`}
                {" · Stored in this browser"}
              </p>
            )}
          </div>
          <Button variant="block" onClick={create} id="btn-create-portfolio">
            <Plus /> New portfolio
          </Button>
        </div>

        {/* Guest notice */}
        {guest && (
          <div className="mb-6 block-card bg-accent/20 p-4 flex items-center justify-between gap-4">
            <p className="text-sm">
              <strong>Using as guest.</strong> Portfolios are saved in this browser only.
              Sign in with GitHub to publish live URLs and sync across devices.
            </p>
            <Button asChild variant="block" size="sm" className="shrink-0">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        )}

        {/* Empty state */}
        {list.length === 0 ? (
          <div className="block-card p-16 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10">
              <Plus className="size-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black">No portfolios yet</h2>
            <p className="mt-2 text-muted-foreground">
              Create your first portfolio — it only takes a few minutes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="block" onClick={create}>
                <Plus /> Create portfolio
              </Button>
              <Button asChild variant="blockOutline">
                <Link to="/create">Quick create wizard</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {list.map((p) => {
              const isPublished = !!p.github_repo;
              const liveUrl = isPublished && !guest
                ? `https://${login}.github.io/${p.github_repo}/`
                : null;

              return (
                <div key={p.id} className="block-card flex flex-col p-6 gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold truncate">{p.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isPublished && !guest
                          ? `github.com/${login}/${p.github_repo}`
                          : `Updated ${new Date(p.updated_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold border-2 ${isPublished
                          ? "bg-accent border-ink/20 text-ink"
                          : "bg-muted border-ink/10 text-muted-foreground"
                        }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Color preview */}
                  {p.theme?.palette && (
                    <div className="flex gap-1 h-2">
                      {Object.values(p.theme.palette).slice(0, 5).map((color, i) => (
                        <div key={i} className="flex-1 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap mt-auto">
                    <Button asChild variant="block" size="sm">
                      <Link to="/editor/$id" params={{ id: p.id }}>
                        Edit
                      </Link>
                    </Button>
                    {liveUrl ? (
                      <Button asChild variant="blockOutline" size="sm">
                        <a href={liveUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-3.5" /> View live
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => doDownload(p)}
                      disabled={downloading === p.id}
                      title="Download HTML"
                    >
                      {downloading === p.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Download className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => remove(p.id)}
                      title="Delete portfolio"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* New portfolio card */}
            <button
              type="button"
              onClick={create}
              className="block-card flex flex-col items-center justify-center gap-3 p-8 text-center border-dashed hover:bg-muted/40 transition-colors group"
            >
              <div className="grid size-12 place-items-center rounded-xl border-2 border-ink/20 bg-muted/50 transition-colors group-hover:bg-primary/10">
                <Plus className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">New portfolio</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Opens in the editor</p>
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
