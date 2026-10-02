import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { renderPortfolioHtml } from "./export-html";

const inputSchema = z.object({
  title: z.string(),
  content: z.any(),
  theme: z.any(),
  sections: z.any(),
});

/** Server-render a complete standalone HTML portfolio for download. */
export const exportPortfolioHtml = createServerFn({ method: "POST" })
  .validator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const html = await renderPortfolioHtml({
      title: data.title,
      content: data.content,
      theme: data.theme,
      sections: data.sections,
    });
    return { html };
  });
