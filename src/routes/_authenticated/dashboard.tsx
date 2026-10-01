import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { defaultContent, defaultSections, defaultTheme, uid } from "@/lib/portfolio";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your portfolios — Folio" }, { name: "description", content: "Manage your portfolios." }, { property: "og:title", content: "Your portfolios — Folio" }, { property: "og:description", content: "Manage your portfolios." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const nav = useNavigate();
  const list = useQuery({
    queryKey: ["portfolios", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolios").select("id, slug, title, updated_at, github_repo, published").eq("user_id", user.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const base = (user.email?.split("@")[0] ?? "me").toLowerCase().replace(/[^a-z0-9-]/g, "");
      const { data, error } = await supabase.from("portfolios").insert({
        user_id: user.id, slug: `${base}-${uid().slice(0, 4)}`, title: "My Portfolio",
        content: defaultContent() as never, theme: defaultTheme() as never, sections: defaultSections() as never,
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => nav({ to: "/editor/$id", params: { id } }),
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("portfolios").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolios"] }),
  });

  return (
    <div className="min-h-screen grain">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-black italic">Folio.</Link>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </nav>
      <main className="mx-auto max-w-5xl px-6 pb-20">
        <div className="mb-10 flex items-end justify-between">
          <h1 className="text-5xl font-black">Your portfolios</h1>
          <Button variant="block" onClick={() => create.mutate()} disabled={create.isPending}><Plus /> New portfolio</Button>
        </div>
        {list.isLoading ? <p>Loading…</p> : list.data?.length === 0 ? (
          <div className="block-card p-10 text-center">
            <p className="text-lg">No portfolios yet.</p>
            <Button variant="block" className="mt-4" onClick={() => create.mutate()}>Create your first</Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {list.data?.map((p) => (
              <div key={p.id} className="block-card flex flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-2xl font-bold">{p.title}</h2>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${p.published ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    {p.published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">/p/{p.slug}{p.github_repo ? ` · GitHub: ${p.github_repo}` : ""}</p>
                <div className="mt-6 flex gap-2">
                  <Button asChild variant="block" size="sm"><Link to="/editor/$id" params={{ id: p.id }}>Edit</Link></Button>
                  {p.published ? (
                    <Button asChild variant="blockOutline" size="sm"><Link to="/p/$slug" params={{ slug: p.slug }} target="_blank"><ExternalLink /> View</Link></Button>
                  ) : (
                    <Button variant="blockOutline" size="sm" disabled title="Publish to make visible"><ExternalLink /> View</Button>
                  )}
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => confirm("Delete this portfolio?") && remove.mutate(p.id)}><Trash2 /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
