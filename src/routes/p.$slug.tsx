import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PortfolioView } from "@/components/PortfolioView";
import { useGithubRepos } from "@/hooks/use-github-repos";
import { loadSession } from "@/lib/auth";
import { normalize } from "@/lib/portfolio";
import { getBySlug, listPortfolios } from "@/lib/storage";

export const Route = createFileRoute("/p/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Portfolio preview — Folio" },
      {
        name: "description",
        content: "Local preview. Published sites live on GitHub Pages.",
      },
    ],
  }),
  component: PublicPortfolio,
});

function PublicPortfolio() {
  const { slug } = Route.useParams();
  const row = useMemo(() => {
    const session = loadSession();
    if (!session) return null;
    return getBySlug(session.user.login, slug);
  }, [slug]);

  if (!row) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-black">Preview not available</h1>
          <p className="mt-3 text-muted-foreground">
            Drafts are stored in your browser. Sign in on this device to preview, or publish to
            GitHub Pages for a public URL.
          </p>
          <Link to="/" className="mt-6 inline-block underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const { content, theme, sections } = normalize(row);
  const repos = useGithubRepos(content.githubUsername);
  return (
    <PortfolioView
      content={content}
      theme={theme}
      sections={sections}
      repos={repos.data ?? null}
      liquidBackground={true}
    />
  );
}
