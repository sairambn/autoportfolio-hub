import { exportPortfolioHtml } from "./export.functions";
import { generatePortfolioPdfFromData, type PdfExportOptions } from "./pdf-export";

/** Download a full portfolio as a single index.html file (no GitHub needed). */
export async function downloadPortfolioHtml(opts: {
  title: string;
  content: unknown;
  theme: unknown;
  sections: unknown;
  filename?: string;
}) {
  const { html } = (await exportPortfolioHtml({
    data: {
      title: opts.title,
      content: opts.content,
      theme: opts.theme,
      sections: opts.sections,
    },
  })) as { html: string };

  const safe =
    (opts.filename || opts.title || "portfolio")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "portfolio";

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Download a portfolio as a PDF file for offline viewing or printing. */
export async function downloadPortfolioPdf(opts: {
  title: string;
  content: unknown;
  theme: unknown;
  sections: unknown;
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
}) {
  return generatePortfolioPdfFromData(
    {
      title: opts.title,
      content: opts.content,
      theme: opts.theme,
      sections: opts.sections,
    },
    {
      filename: opts.filename,
      format: opts.format || "a4",
      orientation: opts.orientation || "portrait",
    },
  );
}
