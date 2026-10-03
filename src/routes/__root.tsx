import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { FONTS } from "@/lib/portfolio";

function NotFoundComponent() {
  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center px-4">
      <Link to="/" className="font-display text-2xl font-black italic mb-16">
        Folio.
      </Link>
      <div className="max-w-md text-center">
        <p className="font-display text-[120px] font-black leading-none text-ink/10">404</p>
        <h1 className="-mt-4 text-4xl font-black">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-[3px_3px_0_0_var(--color-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            Go home
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-card px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_0_var(--color-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            Create portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center px-4">
      <Link to="/" className="font-display text-2xl font-black italic mb-16">
        Folio.
      </Link>
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-black">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred. Try refreshing or go back home."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md border-2 border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-[3px_3px_0_0_var(--color-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border-2 border-ink bg-card px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_0_var(--color-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const allFonts = `https://fonts.googleapis.com/css2?${Object.values(FONTS)
  .map((f) => f.google)
  .join("&")}&family=JetBrains+Mono:wght@400;700&display=swap`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Folio — Portfolio builder" },
      {
        name: "description",
        content: "Build a custom portfolio and publish it to GitHub automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: allFonts },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
