import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPublicPortfolio } from "@/lib/public.functions";
import { normalize } from "@/lib/portfolio";
import { PortfolioView } from "@/components/PortfolioView";
import { useGithubRepos } from "@/hooks/use-github-repos";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const row = await getPublicPortfolio({ data: { slug: params.slug } });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Portfolio not found" }, { name: "robots", content: "noindex" }] };
    const { content } = normalize(loaderData);
    const t = `${content.name} — Portfolio`;
    return { meta: [{ title: t }, { name: "description", content: content.headline }, { property: "og:title", content: t }, { property: "og:description", content: content.headline }, { property: "og:type", content: "profile" }] };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center"><div className="text-center"><h1 className="text-4xl font-black">Portfolio not found</h1><Link to="/" className="mt-4 inline-block underline">Go home</Link></div></div>
  ),
  errorComponent: ({ error }) => <div className="p-10">Couldn't load this portfolio: {error.message}</div>,
  component: PublicPortfolio,
});

function PublicPortfolio() {
  const row = Route.useLoaderData();
  const { content, theme, sections } = normalize(row);
  const repos = useGithubRepos(content.githubUsername);
  return <PortfolioView content={content} theme={theme} sections={sections} repos={repos.data ?? null} />;
}
