import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { PortfolioView } from "@/components/PortfolioView";
import { useGithubRepos } from "@/hooks/use-github-repos";
import { loadSession } from "@/lib/auth";
import { auth, findPortfolioInFirestore, onAuthStateChanged } from "@/lib/firebase";
import {
  defaultContent,
  defaultSections,
  defaultTheme,
  normalize,
  type Content,
  type Section,
  type Theme,
} from "@/lib/portfolio";
import { getBySlug, upsertPortfolio, type PortfolioRecord } from "@/lib/storage";

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

  // 1. Initial fast local cache check
  const [row, setRow] = useState<
    PortfolioRecord | { content: unknown; theme: unknown; sections: unknown } | null
  >(() => {
    if (slug === "preview" || slug === "draft" || slug === "demo" || slug.startsWith("draft-")) {
      return {
        id: "demo-preview",
        slug,
        title: "Sample Portfolio",
        published: true,
        github_repo: null,
        auto_push: false,
        last_pushed_at: null,
        content: defaultContent(),
        theme: defaultTheme(),
        sections: defaultSections(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const session = loadSession();
    return getBySlug(session?.user?.login || "", slug);
  });

  const [loading, setLoading] = useState<boolean>(!row);

  useEffect(() => {
    let active = true;

    // Check again if slug changes
    const localMatch = getBySlug(loadSession()?.user?.login || "", slug);
    if (localMatch) {
      setRow(localMatch);
      setLoading(false);
      return;
    }

    // Attempt Firebase Firestore lookup
    const checkFirestore = async (uid: string) => {
      try {
        const doc = await findPortfolioInFirestore(uid, slug);
        if (doc && active) {
          const rec: PortfolioRecord = {
            id: doc.id,
            slug: doc.slug,
            title: doc.title,
            published: doc.published,
            github_repo: doc.github_repo,
            auto_push: doc.auto_push,
            last_pushed_at: doc.last_pushed_at,
            content: doc.content as Content,
            theme: doc.theme as Theme,
            sections: doc.sections as Section[],
            created_at: doc.createdAt,
            updated_at: doc.updatedAt,
          };
          const login = loadSession()?.user?.login || "user";
          upsertPortfolio(login, rec);
          setRow(rec);
          setLoading(false);
          return true;
        }
      } catch (err) {
        console.warn("Could not load portfolio from Firestore in preview:", err);
      }
      return false;
    };

    if (auth.currentUser) {
      checkFirestore(auth.currentUser.uid).then((found) => {
        if (!found && active) {
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && active) {
        const found = await checkFirestore(user.uid);
        if (found) return;
      }
      if (active) {
        // Final fallback search across all local storage keys
        const finalLocal = getBySlug("", slug);
        if (finalLocal) {
          setRow(finalLocal);
        }
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsub();
    };
  }, [slug]);

  const normalized = useMemo(() => (row ? normalize(row) : null), [row]);
  const repos = useGithubRepos(normalized?.content.githubUsername);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading portfolio preview...</p>
        </div>
      </div>
    );
  }

  if (!row || !normalized) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-black tracking-tight">Portfolio Preview</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This portfolio ({slug}) could not be found on this device or your connected account.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/create"
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Create New
            </Link>
            <button
              type="button"
              onClick={() => {
                setRow({
                  id: "sample-preview",
                  slug,
                  title: "Sample Portfolio",
                  published: true,
                  github_repo: null,
                  auto_push: false,
                  last_pushed_at: null,
                  content: defaultContent(),
                  theme: defaultTheme(),
                  sections: defaultSections(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-muted px-4 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
            >
              View Sample Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { content, theme, sections } = normalized;
  return (
    <PortfolioView content={content} theme={theme} sections={sections} repos={repos.data ?? null} />
  );
}
