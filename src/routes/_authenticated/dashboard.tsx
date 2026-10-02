import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/auth";
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
    if (!confirm("Delete this portfolio from this browser?")) return;
    deletePortfolio(login, id);
    refresh();
  }

  function signOut() {
    clearSession();
    nav({ to: "/" });
  }

  return (
    <div className="min-h-screen grain">
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
          <span className="text-sm font-medium">{guest ? "Guest" : `@${login}`}</span>
          {guest ? (
            <Button asChild variant="blockOutline" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          ) : (
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          )}
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-6 pb-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black">Your portfolios</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Saved in this browser. Download HTML anytime — or publish to GitHub if you signed in.
            </p>
          </div>
          <Button variant="block" onClick={create}>
            <Plus /> New portfolio
          </Button>
        </div>
        {list.length === 0 ? (
          <div className="block-card p-10 text-center">
            <p className="text-lg">No portfolios yet.</p>
            <Button variant="block" className="mt-4" onClick={create}>
              Create your first
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {list.map((p) => (
              <div key={p.id} className="block-card flex flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-2xl font-bold">{p.title}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.github_repo
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.github_repo ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.github_repo && !guest
                    ? `github.com/${login}/${p.github_repo}`
                    : "Download HTML or publish later"}
                </p>
                <div className="mt-6 flex gap-2">
                  <Button asChild variant="block" size="sm">
                    <Link to="/editor/$id" params={{ id: p.id }}>
                      Edit
                    </Link>
                  </Button>
                  {p.github_repo && !guest ? (
                    <Button asChild variant="blockOutline" size="sm">
                      <a
                        href={`https://${login}.github.io/${p.github_repo}/`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink /> View
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
