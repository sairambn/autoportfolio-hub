import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public portfolio lookup by slug — GitHub-only mode has no central DB,
 * so this always returns null. Live sites are served from GitHub Pages.
 */
export const getPublicPortfolio = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async () => {
    return null as {
      slug: string;
      title: string;
      content: unknown;
      theme: unknown;
      sections: unknown;
    } | null;
  });
